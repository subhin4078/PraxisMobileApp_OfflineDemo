import { ProfileBottomMenu } from "@/src/screens/profileScreen/ProfileBottomMenu";
import { ProfileHeader } from "@/src/screens/profileScreen/ProfileHeader";
import { ProfileLogoutButton } from "@/src/screens/profileScreen/ProfileLogoutButton";
import { ProfileMainMenu } from "@/src/screens/profileScreen/ProfileMainMenu";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <ProfileHeader />
          <View className="px-5 py-4">
            <Text className="mb-3 mt-2 px-1 font-fredokaSemiBold text-xs text-mutedText">
              {t("profile.profile").toUpperCase()}
            </Text>
            <ProfileMainMenu />

            <Text className="mb-3 mt-4 px-1 font-fredokaSemiBold text-xs text-mutedText">
              {t("profile.account").toUpperCase()}
            </Text>
            <ProfileBottomMenu />

            <View className="mt-4">
              <ProfileLogoutButton />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
