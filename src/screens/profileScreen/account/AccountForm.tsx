import useTheme from "@/src/hooks/useTheme";
import { AccountData } from "@/src/types/api";
import { shouldNavigate } from "@/src/utils";
import { formatLongDateTime } from "@/src/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

interface AccountFormProps {
  initialData: AccountData;
}

export function AccountForm({ initialData }: AccountFormProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  const formatDate = (dateString: string) =>
    formatLongDateTime(dateString, i18n.language);

  return (
    <View className="gap-5">
      {/* Account Info */}
      <View className="rounded-2xl bg-surface p-4">
        <Text className="mb-3 font-fredokaSemiBold text-base text-primaryText">
          {t("account.accountInfo")}
        </Text>
        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="font-fredokaRegular text-sm text-secondaryText">
              {t("account.registeredAt")}
            </Text>
            <Text className="font-fredokaMedium text-sm text-primaryText">
              {formatDate(initialData.registeredAt)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-fredokaRegular text-sm text-secondaryText">
              {t("account.lastLogin")}
            </Text>
            <Text className="font-fredokaMedium text-sm text-primaryText">
              {formatDate(initialData.lastLogin)}
            </Text>
          </View>
        </View>
      </View>

      {/* Edit Account Fields */}
      <View>
        <Text className="mb-3 font-fredokaSemiBold text-base text-primaryText">
          {t("account.editAccount")}
        </Text>
        <View className="gap-3">
          {/* Username Field */}
          <Pressable
            onPress={() => {
              if (shouldNavigate())
                router.push("/profile/edit-account-field?type=username");
            }}
            className="flex-row items-center justify-between rounded-xl bg-surface p-4 active:opacity-70"
          >
            <View className="flex-1">
              <Text className="font-fredokaRegular mb-1 text-xs text-secondaryText">
                {t("auth.username")}
              </Text>
              <Text className="font-fredokaMedium text-base text-primaryText">
                {initialData.username}
              </Text>
            </View>
            <Ionicons name="open-outline" size={20} color={colors.primary} />
          </Pressable>

          {/* Email Field */}
          <Pressable
            onPress={() => {
              if (shouldNavigate())
                router.push("/profile/edit-account-field?type=email");
            }}
            className="flex-row items-center justify-between rounded-xl bg-surface p-4 active:opacity-70"
          >
            <View className="flex-1">
              <Text className="font-fredokaRegular mb-1 text-xs text-secondaryText">
                {t("auth.email")}
              </Text>
              <Text className="font-fredokaMedium text-base text-primaryText">
                {initialData.email}
              </Text>
            </View>
            <Ionicons name="open-outline" size={20} color={colors.primary} />
          </Pressable>

          {/* Change Password Button */}
          <Pressable
            onPress={() => {
              if (shouldNavigate())
                router.push("/profile/edit-account-field?type=password");
            }}
            className="flex-row items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 active:opacity-70"
          >
            <Ionicons name="lock-closed" size={20} color={colors.whiteText} />
            <Text className="font-fredokaSemiBold text-base text-white">
              {t("account.changePassword")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
