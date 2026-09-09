import { MathBackground } from "@/src/components/MathBackground";
import useTheme from "@/src/hooks/useTheme";
import { AuthRegisterForm } from "@/src/screens/registerScreen/AuthRegisterForm";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

function RegisterHeader() {
  const { t } = useTranslation();

  return (
    <View className="mb-8 items-center">
      <Text className="font-fredokaSemiBold text-2xl color-primaryText">
        {t("auth.createAccount")}
      </Text>
    </View>
  );
}

function RegisterFormCard() {
  const { colors } = useTheme();

  return (
    <View
      className="w-full rounded-3xl p-8 shadow-sm"
      style={{
        backgroundColor: `${colors.surface}DD`,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      <RegisterHeader />
      <AuthRegisterForm />
    </View>
  );
}

function RegisterFooter() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="mt-8 flex-row justify-center">
      <Text className="font-fredokaSemiBold text-base color-whiteText">
        {t("auth.alreadyHaveAccount")}{" "}
      </Text>
      <Pressable onPress={() => router.push("/auth/login")}>
        <Text className="font-fredokaSemiBold text-base underline color-whiteText">
          {t("auth.login")}
        </Text>
      </Pressable>
    </View>
  );
}

export default function RegisterRoute() {
  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <MathBackground />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
          paddingBottom: 20,
        }}
      >
        <View className="items-center justify-center pb-8 pt-8">
          <RegisterFormCard />
          <RegisterFooter />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
