import { useDeleteChatroom } from "@/src/api/chat/useDeleteChatroom";
import {
  GenerateFollowUpResponse,
  useGenerateFollowUp,
} from "@/src/api/chat/useGenerateFollowUp";
import { Chatroom, useGetChatrooms } from "@/src/api/chat/useGetChatrooms";
import { Message, useGetMessages } from "@/src/api/chat/useGetMessages";
import {
  MarkedQuestion,
  useMarkFollowUp,
} from "@/src/api/chat/useMarkFollowUp";
import {
  SendMessageResponse,
  useSendMessage,
} from "@/src/api/chat/useSendMessage";
import { useUpdateChatroomTitle } from "@/src/api/chat/useUpdateChatroomTitle";
import { useSendMessageWithOCR } from "@/src/api/utility/useScanOCR";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { CommonSvgAssets } from "@/src/constants/assets/commonAssets";
import useTheme from "@/src/hooks/useTheme";
import { AttachedFile, ChatInput } from "@/src/screens/chatScreen/ChatInput";
import { ChatMessage } from "@/src/screens/chatScreen/ChatMessage";
import { FollowUpQuestions } from "@/src/screens/chatScreen/FollowUpQuestions";
import useUserStore from "@/src/stores/useUserStore";
import {
  getHttpErrorImage,
  getHttpErrorMessage,
  getHttpStatus,
} from "@/src/utils/httpError";
import logger from "@/src/utils/logger";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Detect server-stored follow-up content shapes */
function detectFollowUpContent(
  content: unknown,
): "marked" | "generated" | null {
  if (typeof content !== "object" || content === null) return null;
  const obj = content as Record<string, unknown>;
  if ("status" in obj && "questionType" in obj && Array.isArray(obj.questions))
    return "marked";
  if (
    "messageId" in obj &&
    Array.isArray(obj.questions) &&
    !("inputType" in obj) &&
    !("status" in obj)
  )
    return "generated";
  return null;
}

// Type for display messages (includes loading state and follow-up data)
interface DisplayMessage extends Message {
  isLoading?: boolean;
  followUpData?: GenerateFollowUpResponse;
  markingResult?: MarkedQuestion[] | null;
}

export default function ChatroomScreen() {
  const MESSAGE_LIST_BOTTOM_SPACER = 96;
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { userId } = useUserStore();
  const { id, scannedText, aiResponse } = useLocalSearchParams<{
    id: string;
    scannedText?: string;
    aiResponse?: string;
  }>();
  const scrollViewRef = useRef<ScrollView>(null);

  // Local messages for optimistic UI
  const [localMessages, setLocalMessages] = useState<DisplayMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [initialSeeded, setInitialSeeded] = useState(false);
  const hasInitiallyScrolled = useRef(false);

  // Dropdown menu state
  const [menuVisible, setMenuVisible] = useState(false);

  // Delete confirm state
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // Rename modal state
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // Get chatroom info for the title
  const { data: chatrooms } = useGetChatrooms(userId!);
  const chatroom = useMemo<Chatroom | undefined>(
    () => chatrooms?.find((c) => c.chatId === id),
    [chatrooms, id],
  );

  const { mutate: updateTitle } = useUpdateChatroomTitle(userId!);
  const { mutate: deleteChatroom } = useDeleteChatroom(userId!);

  const {
    data: serverMessages,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMessages(userId!, id);
  const errorStatus = getHttpStatus(error);
  const { mutateAsync: sendMessage } = useSendMessage(userId!, id);
  const { mutateAsync: sendMessageWithOCR } = useSendMessageWithOCR(
    userId!,
    id,
  );

  // Follow-up questions state
  const { mutateAsync: generateFollowUp, isPending: isGeneratingFollowUp } =
    useGenerateFollowUp(userId!, id);
  const { mutateAsync: markFollowUp, isPending: isMarkingFollowUp } =
    useMarkFollowUp(userId!, id);

  const handleGenerateFollowUp = async () => {
    try {
      const result = await generateFollowUp();
      // Insert follow-up as a special message entry
      const followUpMessage: DisplayMessage = {
        role: "model" as const,
        content: "",
        timestamp: new Date().toISOString(),
        followUpData: result,
        markingResult: null,
      };
      setLocalMessages((prev) => [...prev, followUpMessage]);
    } catch {
      // Error toast is handled by the hook
    }
  };

  const handleSubmitFollowUpAnswers = async (
    answers: string[],
    messageId: string,
  ) => {
    try {
      const result = await markFollowUp({ answers, messageId });
      if (result.status === "marked") {
        // Update the follow-up message with marking results
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.followUpData?.messageId === messageId
              ? { ...msg, markingResult: result.questions as MarkedQuestion[] }
              : msg,
          ),
        );
      }
    } catch {
      // Error toast is handled by the hook
    }
  };

  // Seed initial messages from scan (scannedText + aiResponse)
  useEffect(() => {
    if (!initialSeeded && scannedText) {
      const seedMessages: DisplayMessage[] = [];

      // Add user's scanned text as first message
      seedMessages.push({
        role: "user",
        content: scannedText,
        timestamp: new Date().toISOString(),
      });

      // Add AI response if available
      if (aiResponse) {
        try {
          const parsed = JSON.parse(aiResponse);
          seedMessages.push({
            role: "model",
            content: parsed as Message["content"],
            timestamp: new Date().toISOString(),
          });
        } catch (e) {
          logger.error("Failed to parse AI response:", String(e));
        }
      }

      setLocalMessages(seedMessages);
      setInitialSeeded(true);
    }
  }, [scannedText, aiResponse, initialSeeded]);

  // Sync server messages to local state when loaded
  // Server data takes priority over seeded scan messages
  useEffect(() => {
    if (serverMessages && serverMessages.length > 0 && !isSending) {
      setLocalMessages(serverMessages);
      if (!hasInitiallyScrolled.current) {
        hasInitiallyScrolled.current = true;
        setTimeout(
          () => scrollViewRef.current?.scrollToEnd({ animated: false }),
          150,
        );
      }
    }
  }, [serverMessages, isSending]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (localMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [localMessages.length]);

  const handleSend = async (messageContent: string, file?: AttachedFile) => {
    if ((!messageContent.trim() && !file) || isSending) return;

    // Create user message
    const userMessage: DisplayMessage = {
      role: "user",
      content: messageContent || t("chat.defaultOCRPrompt"),
      timestamp: new Date().toISOString(),
    };

    // Create loading message for AI
    const loadingMessage: DisplayMessage = {
      role: "model",
      content: "",
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    // Add user message and loading message immediately
    setLocalMessages((prev) => [...prev, userMessage, loadingMessage]);
    setIsSending(true);

    try {
      let response: SendMessageResponse;

      if (file) {
        // Send via OCR endpoint when file is attached
        response = await sendMessageWithOCR({
          imageUri: file.uri,
          content: messageContent || t("chat.defaultOCRPrompt"),
        });
      } else {
        // Send as plain text message
        response = await sendMessage({ content: messageContent });
      }

      // Remove loading message and add AI response
      setLocalMessages((prev) => {
        const withoutLoading = prev.filter((msg) => !msg.isLoading);
        const aiMessage: DisplayMessage = {
          role: "model",
          content: response as unknown as Message["content"],
          timestamp: new Date().toISOString(),
        };
        return [...withoutLoading, aiMessage];
      });
    } catch (error) {
      // Remove loading message on error
      setLocalMessages((prev) => prev.filter((msg) => !msg.isLoading));
      logger.error("Failed to send message:", String(error));
    } finally {
      setIsSending(false);
    }
  };

  const handleRename = () => {
    setMenuVisible(false);
    setRenameValue(chatroom?.title || "");
    setRenameModalVisible(true);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm = () => {
    deleteChatroom(id);
    setDeleteConfirmVisible(false);
    router.back();
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim()) {
      updateTitle({ chatId: id, title: renameValue.trim() });
    }
    setRenameModalVisible(false);
    setRenameValue("");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 py-4"
          style={{ backgroundColor: colors.primary }}
        >
          <Pressable
            onPress={() => router.back()}
            className="active:opacity-70"
          >
            <Ionicons name="chevron-back" size={24} color={colors.whiteText} />
          </Pressable>
          <Text
            className="flex-1 px-4 text-center font-fredokaSemiBold text-lg"
            style={{ color: colors.whiteText }}
            numberOfLines={1}
          >
            {chatroom?.title || t("chat.chatroom")}
          </Text>
          <Pressable
            onPress={() => setMenuVisible((v) => !v)}
            className="active:opacity-70"
          >
            <Ionicons
              name="ellipsis-vertical"
              size={22}
              color={colors.whiteText}
            />
          </Pressable>
        </View>

        {/* Dropdown Menu */}
        {menuVisible && (
          <>
            <Pressable
              className="absolute bottom-0 left-0 right-0 top-0 z-40"
              onPress={() => setMenuVisible(false)}
            />
            <View
              className="absolute right-4 top-16 z-50 w-48 overflow-hidden rounded-xl shadow-lg"
              style={{
                backgroundColor: colors.surface,
                shadowColor: colors.shadowColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Pressable
                className="flex-row items-center gap-3 px-4 py-3 active:opacity-70"
                style={{ backgroundColor: colors.surface }}
                onPress={handleRename}
              >
                <Ionicons
                  name="pencil-outline"
                  size={18}
                  color={colors.primaryText}
                />
                <Text className="font-fredokaMedium text-sm text-primaryText">
                  {t("chat.rename")}
                </Text>
              </Pressable>
              <View className="mx-3 h-px bg-borderColor" />
              <Pressable
                className="flex-row items-center gap-3 px-4 py-3 active:opacity-70"
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
                <Text
                  className="font-fredokaMedium text-sm"
                  style={{ color: colors.error }}
                >
                  {t("chat.delete")}
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: MESSAGE_LIST_BOTTOM_SPACER }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && localMessages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <LoadingSpinner size="large" color={colors.primary} />
            </View>
          ) : isError && localMessages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Image
                source={getHttpErrorImage(errorStatus)}
                style={{ width: 160, height: 160 }}
                resizeMode="contain"
              />
              <Text className="mt-4 text-center font-fredokaSemiBold text-lg text-primaryText">
                {getHttpErrorMessage(errorStatus, t)}
              </Text>
              <Pressable
                className="mt-6 flex-row items-center gap-2 rounded-full border-2 border-primary px-6 py-3 active:opacity-70"
                onPress={() => refetch()}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text className="font-fredokaSemiBold text-base text-primary">
                  {t("common.tryAgain")}
                </Text>
              </Pressable>
            </View>
          ) : localMessages.length > 0 ? (
            <>
              {localMessages.map((message, index) => {
                // Render local follow-up questions
                if (message.followUpData) {
                  return (
                    <FollowUpQuestions
                      key={`followup-${message.followUpData.messageId}`}
                      data={message.followUpData}
                      onSubmitAnswers={handleSubmitFollowUpAnswers}
                      isSubmitting={isMarkingFollowUp}
                      markingResult={message.markingResult}
                    />
                  );
                }

                // Detect server-stored follow-up content (re-entering chatroom)
                const followUpKind = detectFollowUpContent(message.content);
                if (followUpKind === "marked") {
                  const raw = message.content as Record<string, unknown>;
                  const rawQuestions = raw.questions as Array<
                    MarkedQuestion & { options?: string[] }
                  >;
                  const syntheticData: GenerateFollowUpResponse = {
                    messageId: "server-loaded",
                    questions: rawQuestions.map((q) => ({
                      question: q.question,
                      options: q.options,
                    })),
                  };
                  return (
                    <FollowUpQuestions
                      key={`server-marked-${index}`}
                      data={syntheticData}
                      onSubmitAnswers={() => {}}
                      isSubmitting={false}
                      markingResult={rawQuestions as MarkedQuestion[]}
                    />
                  );
                }
                if (followUpKind === "generated") {
                  const followUpData =
                    message.content as unknown as GenerateFollowUpResponse;
                  return (
                    <FollowUpQuestions
                      key={`server-generated-${index}`}
                      data={followUpData}
                      onSubmitAnswers={handleSubmitFollowUpAnswers}
                      isSubmitting={isMarkingFollowUp}
                      markingResult={null}
                    />
                  );
                }

                // Find the last real (non-follow-up, non-loading) model message
                const lastRealModelIndex = (() => {
                  for (let i = localMessages.length - 1; i >= 0; i--) {
                    const m = localMessages[i];
                    if (m.role === "model" && !m.isLoading && !m.followUpData)
                      return i;
                  }
                  return -1;
                })();

                const isLastModelMessage =
                  message.role === "model" &&
                  !message.isLoading &&
                  index === lastRealModelIndex;
                const isQuestionSolving =
                  isLastModelMessage &&
                  typeof message.content === "object" &&
                  message.content !== null &&
                  "inputType" in message.content &&
                  (message.content as { inputType: string }).inputType ===
                    "problemSolving";

                return (
                  <ChatMessage
                    key={`${message.timestamp}-${index}`}
                    message={message}
                    index={index}
                    onGenerateFollowUp={
                      isQuestionSolving ? handleGenerateFollowUp : undefined
                    }
                    isGeneratingFollowUp={isGeneratingFollowUp}
                  />
                );
              })}
            </>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <CommonSvgAssets.chat width={64} height={64} />
              <Text
                style={{
                  fontFamily: "Fredoka_400Regular",
                  fontSize: 14,
                  color: colors.emptyStateDescriptionText,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {t("chat.startConversation")}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <ChatInput onSend={handleSend} isLoading={isSending} />
      </KeyboardAvoidingView>

      {/* Rename Modal */}
      <Modal
        visible={renameModalVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 px-5"
          onPress={() => setRenameModalVisible(false)}
        >
          <Pressable
            className="w-full rounded-2xl bg-surface p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="mb-2 text-center font-fredokaSemiBold text-lg text-primaryText">
              {t("chat.renameChat")}
            </Text>
            <TextInput
              className="mb-4 rounded-xl border border-borderColor px-4 py-3 font-fredoka text-base text-primaryText"
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder={t("chat.enterTitle")}
              placeholderTextColor={colors.mutedText}
              autoFocus
              maxLength={100}
            />
            <View className="flex-row justify-end gap-3">
              <Pressable
                className="rounded-xl px-5 py-2.5 active:opacity-70"
                onPress={() => setRenameModalVisible(false)}
              >
                <Text className="font-fredokaMedium text-base text-secondaryText">
                  {t("common.cancel")}
                </Text>
              </Pressable>
              <Pressable
                className="rounded-xl px-5 py-2.5 active:opacity-70"
                style={{ backgroundColor: colors.primary }}
                onPress={handleRenameSubmit}
                disabled={!renameValue.trim()}
              >
                <Text
                  className="font-fredokaSemiBold text-base"
                  style={{ color: colors.whiteText }}
                >
                  {t("common.save")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 px-5"
          onPress={() => setDeleteConfirmVisible(false)}
        >
          <Pressable
            className="w-full rounded-2xl bg-surface p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Ionicons
              name="warning-outline"
              size={40}
              color={colors.error}
              style={{ alignSelf: "center", marginBottom: 12 }}
            />
            <Text className="mb-2 text-center font-fredokaSemiBold text-lg text-primaryText">
              {t("chat.deleteConfirmTitle")}
            </Text>
            <Text className="mb-5 text-left font-fredoka text-sm text-secondaryText">
              {t("chat.deleteConfirmMessage")}
            </Text>
            <View className="flex-row justify-end gap-3">
              <Pressable
                className="rounded-xl border border-borderColor px-5 py-2.5 active:opacity-70"
                onPress={() => setDeleteConfirmVisible(false)}
              >
                <Text className="font-fredokaMedium text-base text-secondaryText">
                  {t("common.cancel")}
                </Text>
              </Pressable>
              <Pressable
                className="rounded-xl px-5 py-2.5 active:opacity-70"
                style={{ backgroundColor: colors.error }}
                onPress={handleDeleteConfirm}
              >
                <Text
                  className="font-fredokaSemiBold text-base"
                  style={{ color: colors.whiteText }}
                >
                  {t("chat.delete")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
