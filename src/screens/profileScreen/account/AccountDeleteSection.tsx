import { useDeleteAccount } from "@/src/api/user/useDeleteAccount";
import useTheme from "@/src/hooks/useTheme";
import useUserStore from "@/src/stores/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

export function AccountDeleteSection() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { userId } = useUserStore();
  const { mutate: deleteAccount, isPending } = useDeleteAccount(userId!);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDeleteAccount = () => {
    deleteAccount();
    setShowConfirmModal(false);
  };

  return (
    <>
      {/* Delete Account Button */}
      <View className="rounded-2xl bg-surface p-4">
        <Text className="mb-2 font-fredokaSemiBold text-base text-primaryText">
          {t("account.dangerZone")}
        </Text>
        <Text className="mb-4 font-fredokaRegular text-sm text-secondaryText">
          {t("account.deleteWarning")}
        </Text>
        <Pressable
          onPress={() => setShowConfirmModal(true)}
          className="flex-row items-center justify-center rounded-xl bg-error px-4 py-3 active:opacity-70"
        >
          <Ionicons name="trash-outline" size={20} color={colors.whiteText} />
          <Text className="ml-2 font-fredokaSemiBold text-base text-white">
            {t("account.deleteAccount")}
          </Text>
        </Pressable>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-2xl bg-surface p-6">
            {/* Icon */}
            <View className="mb-4 items-center">
              <View className="bg-error/20 rounded-full p-4">
                <Ionicons
                  name="warning-outline"
                  size={48}
                  color={colors.error}
                />
              </View>
            </View>

            {/* Title */}
            <Text className="mb-2 text-center font-fredokaSemiBold text-lg text-primaryText">
              {t("account.confirmDeleteTitle")}
            </Text>

            {/* Message */}
            <Text className="mb-5 text-left font-fredoka text-sm text-secondaryText">
              {t("account.confirmDeleteMessage")}
            </Text>

            {/* Buttons */}
            <View className="flex-row justify-end gap-3">
              <Pressable
                onPress={() => setShowConfirmModal(false)}
                disabled={isPending}
                className="rounded-xl px-5 py-2.5 active:opacity-70"
              >
                <Text className="font-fredokaMedium text-base text-secondaryText">
                  {t("account.cancel")}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleDeleteAccount}
                disabled={isPending}
                className="rounded-xl px-5 py-2.5 active:opacity-70"
                style={{ backgroundColor: colors.error }}
              >
                {isPending ? (
                  <ActivityIndicator color={colors.whiteText} />
                ) : (
                  <Text className="font-fredokaSemiBold text-base text-whiteText">
                    {t("account.confirmDelete")}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
