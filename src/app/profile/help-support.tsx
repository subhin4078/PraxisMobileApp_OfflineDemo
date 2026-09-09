import { ProfileImageAssets } from "@/src/constants/assets/profileAssets";
import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HelpSupportScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="relative items-center justify-center bg-surface px-5 py-4">
        <Pressable
          className="absolute left-5 active:opacity-70"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primaryText} />
        </Pressable>
        <Text className="font-fredokaSemiBold text-lg text-primaryText">
          {t("profile.helpSupport")}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Help Cat Image */}
        <View className="mb-6 items-center">
          <Image
            source={ProfileImageAssets.help}
            className="h-36 w-72"
            resizeMode="contain"
          />
        </View>

        {/* Placeholder Content */}
        <View className="items-center justify-center py-10">
          <Ionicons
            name="help-circle-outline"
            size={64}
            color={colors.secondaryText}
          />
          <Text className="mt-4 text-center font-fredokaMedium text-base text-secondaryText">
            {t("profile.comingSoon")}
          </Text>
          <Text className="text-tertiaryText mt-2 text-center font-fredokaRegular text-sm">
            {t("profile.helpSupportComingSoonDesc")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
