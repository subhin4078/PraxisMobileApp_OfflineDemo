import { PracticeImageAssets } from "@/src/constants/assets/practiceAssets";
import { useTranslation } from "react-i18next";
import { Image, Text, View } from "react-native";

export function PracticeHeader() {
  const { t } = useTranslation();

  return (
    <View className="items-center bg-surface pb-4 pt-2">
      <Image
        source={PracticeImageAssets.practice}
        className="h-32 w-64"
        resizeMode="contain"
      />
      <Text className="mt-2 font-fredokaSemiBold text-lg text-primaryText">
        {t("practice.title")}
      </Text>
    </View>
  );
}
