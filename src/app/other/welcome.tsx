import { MathBackground } from "@/src/components/MathBackground";
import { APP_CONFIG } from "@/src/constants/app";
import useTheme from "@/src/hooks/useTheme";
import {
  WelcomeActions,
  WelcomeHeader,
  WelcomeMascot,
} from "@/src/screens/welcomeScreen/WelcomeComponents";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function WelcomeRoute() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View className="flex-1">
      <MathBackground />
      <View className="flex-1 justify-between px-8 py-16">
        <WelcomeHeader />
        <WelcomeMascot />
        <WelcomeActions />
      </View>
      <Text
        className="absolute bottom-6 right-5 font-fredokaSemiBold text-xs"
        style={{ color: colors.whiteText }}
      >
        {t("common.versionWithNumber", { version: APP_CONFIG.version })}
      </Text>
    </View>
  );
}
