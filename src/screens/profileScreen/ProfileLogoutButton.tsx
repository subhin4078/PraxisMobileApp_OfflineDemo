import { useLogout } from "@/src/api/auth/useLogout";
import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";

export function ProfileLogoutButton() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { mutate: logout, isPending } = useLogout();

  return (
    <Pressable
      onPress={() => logout()}
      disabled={isPending}
      className="flex-row items-center justify-center gap-3 rounded-2xl bg-error p-4 active:opacity-70"
      style={{
        opacity: isPending ? 0.5 : 1,
      }}
    >
      <Ionicons name="log-out-outline" size={20} color={colors.whiteText} />
      <Text className="font-fredokaSemiBold text-whiteText">
        {isPending ? t("auth.loggingOut") : t("auth.logout")}
      </Text>
    </Pressable>
  );
}
