import { ChatImageAssets } from "@/src/constants/assets/chatAssets";
import { useTranslation } from "react-i18next";
import { Image, Text, View } from "react-native";

export function ChatroomHeader() {
  const { t } = useTranslation();

  return (
    <View className="items-center bg-surface pb-4 pt-2">
      <Image
        source={ChatImageAssets.question}
        className="h-32 w-64"
        resizeMode="contain"
      />
      <Text className="mt-2 font-fredokaSemiBold text-lg text-primaryText">
        {t("chat.askQuestion")}
      </Text>
    </View>
  );
}
