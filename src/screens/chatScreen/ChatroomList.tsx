import { useDeleteChatroom } from "@/src/api/chat/useDeleteChatroom";
import { Chatroom } from "@/src/api/chat/useGetChatrooms";
import { useUpdateChatroomTitle } from "@/src/api/chat/useUpdateChatroomTitle";
import { CommonSvgAssets } from "@/src/constants/assets/commonAssets";
import { HomeSvgAssets } from "@/src/constants/assets/homeAssets";
import useTheme from "@/src/hooks/useTheme";
import useUserStore from "@/src/stores/useUserStore";
import { shouldNavigate } from "@/src/utils";
import { formatRelativeDate } from "@/src/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

interface ChatroomListProps {
  chatrooms: Chatroom[];
}

export function ChatroomList({ chatrooms }: ChatroomListProps) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { userId } = useUserStore();

  const { mutate: deleteChatroom } = useDeleteChatroom(userId!);
  const { mutate: updateTitle } = useUpdateChatroomTitle(userId!);

  // Action menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedChatroom, setSelectedChatroom] = useState<Chatroom | null>(
    null,
  );

  // Delete confirm state
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // Rename modal state
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameChatId, setRenameChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const formatDate = (dateString: string) =>
    formatRelativeDate(dateString, i18n.language, t);

  const handleLongPress = (chatroom: Chatroom) => {
    setSelectedChatroom(chatroom);
    setMenuVisible(true);
  };

  const handleMenuRename = () => {
    if (!selectedChatroom) return;
    setMenuVisible(false);
    setRenameChatId(selectedChatroom.chatId);
    setRenameValue(selectedChatroom.title || "");
    setRenameModalVisible(true);
  };

  const handleMenuDelete = () => {
    setMenuVisible(false);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedChatroom) {
      deleteChatroom(selectedChatroom.chatId);
    }
    setDeleteConfirmVisible(false);
    setSelectedChatroom(null);
  };

  const handleRenameSubmit = () => {
    if (renameChatId && renameValue.trim()) {
      updateTitle({ chatId: renameChatId, title: renameValue.trim() });
    }
    setRenameModalVisible(false);
    setRenameChatId(null);
    setRenameValue("");
  };

  if (chatrooms.length === 0) {
    return (
      <View className="w-full items-center justify-center px-8">
        <CommonSvgAssets.ghost width={80} height={80} />
        <Text className="mt-6 text-center font-fredokaSemiBold text-xl text-chatEmptyTitle">
          {t("chat.noChatrooms")}
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
          {t("chat.noChatroomsDescription")}
        </Text>
      </View>
    );
  }

  // Sort chatrooms by updatedAt descending (latest first)
  const sortedChatrooms = [...chatrooms].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <View className="flex-1 gap-3 px-5">
      {sortedChatrooms.map((chatroom) => (
        <Pressable
          key={chatroom.chatId}
          className="flex-row items-center gap-4 rounded-2xl bg-chatItemBackground p-4 active:opacity-70"
          onPress={() => {
            if (!shouldNavigate()) return;
            router.push({
              pathname: "/chat/[id]",
              params: { id: chatroom.chatId },
            });
          }}
          onLongPress={() => handleLongPress(chatroom)}
        >
          {/* Icon */}
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: `${colors.chatInfoBadgeColor}15` }}
          >
            <HomeSvgAssets.chat width={22} height={22} />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="flex-1 font-fredokaSemiBold text-base text-chatTitle">
                {chatroom.title || t("chat.untitledChat")}
              </Text>
              <Text className="ml-2 font-fredokaRegular text-xs text-chatTimestamp">
                {formatDate(chatroom.updatedAt)}
              </Text>
            </View>
            <Text className="font-fredokaRegular text-sm text-chatMessage">
              {t("chat.tapToOpen")}
            </Text>
          </View>

          {/* Chevron */}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.chatChevron}
          />
        </Pressable>
      ))}

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

      {/* Action Menu Modal (bottom sheet style) */}
      <Modal
        visible={menuVisible}
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setMenuVisible(false)}
        >
          <View className="rounded-t-3xl bg-surface pb-8 pt-2">
            {/* Handle bar */}
            <View className="mb-2 items-center py-2">
              <View className="h-1 w-10 rounded-full bg-borderColor" />
            </View>

            {/* Title */}
            <Text
              className="mb-3 px-6 font-fredokaSemiBold text-base text-primaryText"
              numberOfLines={1}
            >
              {selectedChatroom?.title || t("chat.untitledChat")}
            </Text>

            {/* Rename */}
            <Pressable
              className="flex-row items-center gap-4 px-6 py-3.5 active:opacity-70"
              onPress={handleMenuRename}
            >
              <Ionicons
                name="pencil-outline"
                size={20}
                color={colors.primaryText}
              />
              <Text className="font-fredokaMedium text-base text-primaryText">
                {t("chat.rename")}
              </Text>
            </Pressable>

            {/* Delete */}
            <Pressable
              className="flex-row items-center gap-4 px-6 py-3.5 active:opacity-70"
              onPress={handleMenuDelete}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text
                className="font-fredokaMedium text-base"
                style={{ color: colors.error }}
              >
                {t("chat.delete")}
              </Text>
            </Pressable>

            {/* Cancel */}
            <Pressable
              className="mt-1 flex-row items-center gap-4 px-6 py-3.5 active:opacity-70"
              onPress={() => setMenuVisible(false)}
            >
              <Ionicons
                name="close-outline"
                size={20}
                color={colors.secondaryText}
              />
              <Text className="font-fredokaMedium text-base text-secondaryText">
                {t("common.cancel")}
              </Text>
            </Pressable>
          </View>
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
                onPress={() => {
                  setDeleteConfirmVisible(false);
                  setSelectedChatroom(null);
                }}
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
    </View>
  );
}
