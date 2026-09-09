import useTheme from "@/src/hooks/useTheme";
import { PracticeCreateForm } from "@/src/screens/practiceScreen/PracticeCreateForm";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PracticeCreateScreen() {
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
          {t("practice.newPractice")}
        </Text>
      </View>

      <PracticeCreateForm />
    </SafeAreaView>
  );
}
