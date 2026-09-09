import { MathBackground } from "@/src/components/MathBackground";
import useTheme from "@/src/hooks/useTheme";
import { useToast } from "@/src/hooks/useToast";
import { AuthLoginForm } from "@/src/screens/loginScreen/AuthLoginForm";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

function LoginHeader() {
  const { t } = useTranslation();

  return (
    <View className="mb-8 items-center">
      <Text className="font-fredokaSemiBold text-2xl color-primaryText">
        {t("auth.login")}
      </Text>
    </View>
  );
}

function LoginFormCard() {
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
      <LoginHeader />
      <AuthLoginForm />
    </View>
  );
}

function LoginFooter() {
  const { t } = useTranslation();
  const toast = useToast();

  return (
    <View className="mt-8 flex-row justify-center">
      <Text className="font-fredokaSemiBold text-base color-whiteText">
        {t("auth.noAccount")}{" "}
      </Text>
      <Pressable
        onPress={() =>
          toast.show(t("auth.registrationTemporarilyDisabled"), "error")
        }
        className="active:opacity-70"
      >
        <Text className="font-fredokaSemiBold text-base underline color-whiteText">
          {t("auth.register")}
        </Text>
      </Pressable>
    </View>
  );
}

export default function LoginRoute() {
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
        <View className="items-center justify-center">
          <LoginFormCard />
          <LoginFooter />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
