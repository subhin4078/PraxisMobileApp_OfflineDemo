import { useCreateChatroom } from "@/src/api/chat/useCreateChatroom";
import {
  GenerateFollowUpResponse,
  useGenerateFollowUp,
} from "@/src/api/chat/useGenerateFollowUp";
import { Message } from "@/src/api/chat/useGetMessages";
import {
  MarkedQuestion,
  useMarkFollowUp,
} from "@/src/api/chat/useMarkFollowUp";
import { SendMessageResponse } from "@/src/api/chat/useSendMessage";
import { CommonSvgAssets } from "@/src/constants/assets/commonAssets";
import useTheme from "@/src/hooks/useTheme";
import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import { ChatInput } from "@/src/screens/chatScreen/ChatInput";
import { ChatMessage } from "@/src/screens/chatScreen/ChatMessage";
import { FollowUpQuestions } from "@/src/screens/chatScreen/FollowUpQuestions";
import useUserStore from "@/src/stores/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Type for display messages (includes loading state and follow-up data)
interface DisplayMessage extends Message {
  isLoading?: boolean;
  followUpData?: GenerateFollowUpResponse;
  markingResult?: MarkedQuestion[] | null;
}

export default function NewChatroomScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { userId } = useUserStore();
  const toast = useToast();
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<DisplayMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();

  const { mutateAsync: createChatroom } = useCreateChatroom(userId!);

  // Follow-up questions state
  // These hooks need a valid chatId – they're only usable after the chat is created
  const generateFollowUpHook = useGenerateFollowUp(userId!, chatId || "");
  const markFollowUpHook = useMarkFollowUp(userId!, chatId || "");

  const handleGenerateFollowUp = async () => {
    if (!chatId) return;
    try {
      const result = await generateFollowUpHook.mutateAsync();
      const followUpMessage: DisplayMessage = {
        role: "model" as const,
        content: "",
        timestamp: new Date().toISOString(),
        followUpData: result,
        markingResult: null,
      };
      setLocalMessages((prev) => [...prev, followUpMessage]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (error) {
      // Error toast is handled by the hook
    }
  };

  const handleSubmitFollowUpAnswers = async (
    answers: string[],
    messageId: string,
  ) => {
    if (!chatId) return;
    try {
      const result = await markFollowUpHook.mutateAsync({
        answers,
        messageId,
      });
      if (result.status === "marked") {
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.followUpData?.messageId === messageId
              ? { ...msg, markingResult: result.questions as MarkedQuestion[] }
              : msg,
          ),
        );
      }
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (error) {
      // Error toast is handled by the hook
    }
  };

  const handleSend = async (messageContent: string) => {
    if (!messageContent.trim() || isSending) return;

    // Create user message
    const userMessage: DisplayMessage = {
      role: "user",
      content: messageContent,
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

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      let currentChatId = chatId;

      // Create chatroom if not exists
      if (!currentChatId) {
        currentChatId = await createChatroom({ title: t("chat.newChat") });
        setChatId(currentChatId);
      }

      // Send message and get AI response
      const response: SendMessageResponse = await api.post(
        `/users/${userId}/chats/${currentChatId}/messages`,
        { content: messageContent, isStructured: true, responseStyle: "brief" },
      );

      // Remove loading message and add AI response
      setLocalMessages((prev) => {
        const withoutLoading = prev.filter((msg) => !msg.isLoading);
        const aiMessage: DisplayMessage = {
          role: "model",
          content: response as Record<string, unknown>,
          timestamp: new Date().toISOString(),
        };
        return [...withoutLoading, aiMessage];
      });

      // Scroll to bottom after response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      // Remove loading message on error
      setLocalMessages((prev) => prev.filter((msg) => !msg.isLoading));
      toast.show(t("chat.errors.sendFailed"), "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleBack = () => {
    // Invalidate chatrooms to refresh the list
    if (chatId) {
      queryClient.invalidateQueries({ queryKey: ["chatrooms", userId] });
    }
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
      >
        {/* Header */}
        <View className="relative items-center justify-center bg-surface px-5 py-4">
          <Pressable
            className="absolute left-5 active:opacity-70"
            onPress={handleBack}
            disabled={isSending}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.primaryText}
            />
          </Pressable>
          <Text className="font-fredokaSemiBold text-lg text-primaryText">
            {t("chat.newChat")}
          </Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-5 py-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {localMessages.length > 0 ? (
            <>
              {localMessages.map((message, index) => {
                // Render follow-up questions inline
                if (message.followUpData) {
                  return (
                    <FollowUpQuestions
                      key={`followup-${message.followUpData.messageId}`}
                      data={message.followUpData}
                      onSubmitAnswers={handleSubmitFollowUpAnswers}
                      isSubmitting={markFollowUpHook.isPending}
                      markingResult={message.markingResult}
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
                const isStructuredAI =
                  isLastModelMessage &&
                  chatId &&
                  typeof message.content === "object" &&
                  message.content !== null &&
                  "inputType" in message.content &&
                  (message.content as { inputType: string }).inputType !==
                    "mathUnrelated";

                return (
                  <ChatMessage
                    key={`${message.timestamp}-${index}`}
                    message={message}
                    index={index}
                    onGenerateFollowUp={
                      isStructuredAI ? handleGenerateFollowUp : undefined
                    }
                    isGeneratingFollowUp={generateFollowUpHook.isPending}
                  />
                );
              })}
            </>
          ) : (
            <View className="flex-1 items-center justify-center">
              <CommonSvgAssets.chat width={64} height={64} />
              <Text className="mt-6 text-center font-fredokaSemiBold text-xl text-chatEmptyTitle">
                {t("chat.startConversation")}
              </Text>
              <Text
                style={{
                  fontFamily: "Fredoka_400Regular",
                  fontSize: 14,
                  color: colors.emptyStateDescriptionText,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {t("chat.typeFirstMessage")}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <ChatInput onSend={handleSend} isLoading={isSending} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
