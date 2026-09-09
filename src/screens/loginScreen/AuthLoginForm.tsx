import { useLogin } from "@/src/api/auth/useLogin";
import { FormInput } from "@/src/components/FormInput";
import { LoadingButton } from "@/src/components/LoadingButton";
import useTheme from "@/src/hooks/useTheme";
import { LoginFormData, createLoginFormSchema } from "@/src/types/form";
import { delay } from "@/src/utils/delay";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

export function AuthLoginForm() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { mutate: login, isPending } = useLogin();
  const [isDelaying, setIsDelaying] = useState(false);
  const [hasLoginFailed, setHasLoginFailed] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginFormSchema(t)),
    defaultValues: {
      userNameOrEmail: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsDelaying(true);
    await delay(1000); // Minimum 1 seconds to show animation
    login(data, {
      onError: () => setHasLoginFailed(true),
    });
    setIsDelaying(false);
  };

  const isLoading = isSubmitting || isPending || isDelaying;

  const tips = [
    t("auth.passwordTips.length"),
    t("auth.passwordTips.uppercase"),
    t("auth.passwordTips.number"),
  ];

  return (
    <View className="space-y-5">
      <FormInput
        control={control}
        name="userNameOrEmail"
        label={t("auth.usernameOrEmail")}
        placeholder={t("auth.usernameOrEmailPlaceholder")}
        startIcon="at-circle-outline"
      />

      <View>
        <FormInput
          control={control}
          name="password"
          label={t("auth.password")}
          placeholder={t("auth.passwordPlaceholder")}
          secureTextEntry
          startIcon="lock-closed-outline"
        />
        <Pressable className="mt-2 self-end">
          <Text className="font-fredokaSemiBold color-primaryDark">
            {t("auth.forgotPassword")}
          </Text>
        </Pressable>

        {/* Password tips — shown only after first failed login */}
        {hasLoginFailed && (
          <View
            className="mt-3 rounded-2xl p-3"
            style={{ backgroundColor: `${colors.primary}12` }}
          >
            <View className="mb-1.5 flex-row items-center gap-1.5">
              <Ionicons
                name="information-circle-outline"
                size={15}
                color={colors.primary}
              />
              <Text
                className="font-fredokaSemiBold text-xs"
                style={{ color: colors.primary }}
              >
                {t("auth.passwordTips.title")}
              </Text>
            </View>
            {tips.map((tip) => (
              <View key={tip} className="flex-row items-center gap-2 py-0.5">
                <View
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                />
                <Text className="font-fredoka text-xs text-mutedText">
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <LoadingButton
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        isLoading={isLoading}
        label={t("auth.login")}
      />
    </View>
  );
}
