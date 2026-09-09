import { useRegister } from "@/src/api/auth/useRegister";
import { FormInput } from "@/src/components/FormInput";
import { FormPicker } from "@/src/components/FormPicker";
import { LoadingButton } from "@/src/components/LoadingButton";
import { PickerProvider } from "@/src/components/PickerContext";
import useTheme from "@/src/hooks/useTheme";
import { RegisterFormData, createRegisterFormSchema } from "@/src/types/form";
import { delay } from "@/src/utils/delay";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

const STEP1_FIELDS: (keyof RegisterFormData)[] = [
  "username",
  "email",
  "password",
  "confirmPassword",
];

export function AuthRegisterForm() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { mutate: register, isPending } = useRegister();
  const [isDelaying, setIsDelaying] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(createRegisterFormSchema(t)),
    shouldUnregister: false,
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      age: "",
      gender: "",
      grade: "",
    },
  });

  const handleNext = async () => {
    const valid = await trigger(STEP1_FIELDS);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsDelaying(true);
    await delay(1000);
    register(data);
    setIsDelaying(false);
  };

  const isLoading = isSubmitting || isPending || isDelaying;

  const passwordValue = watch("password") ?? "";
  const passwordRules = [
    {
      key: "length",
      label: t("auth.passwordRequirements.length"),
      ok: passwordValue.length >= 8 && passwordValue.length <= 64,
    },
    {
      key: "upper",
      label: t("auth.passwordRequirements.uppercase"),
      ok: /[A-Z]/.test(passwordValue),
    },
    {
      key: "lower",
      label: t("auth.passwordRequirements.lowercase"),
      ok: /[a-z]/.test(passwordValue),
    },
    {
      key: "num",
      label: t("auth.passwordRequirements.number"),
      ok: /[0-9]/.test(passwordValue),
    },
    {
      key: "chars",
      label: t("auth.passwordRequirements.chars"),
      ok:
        passwordValue.length > 0 &&
        /^[a-zA-Z0-9 !@#$%^&*()\-_=+?\[\]{}|,.;:]+$/.test(passwordValue),
    },
  ];

  return (
    <View className="space-y-5">
      {/* Step indicator */}
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row gap-2">
          {[1, 2].map((s) => (
            <View
              key={s}
              className="h-2 w-10 rounded-full"
              style={{
                backgroundColor:
                  s <= step ? colors.primary : colors.borderColor,
              }}
            />
          ))}
        </View>
        <Text className="font-fredoka text-xs text-mutedText">
          {t("auth.stepOf", { current: step, total: 2 })}
        </Text>
      </View>

      {/* Step 1 fields — always mounted, hidden when on step 2 */}
      <View style={{ display: step === 1 ? "flex" : "none" }}>
        <FormInput
          control={control}
          name="username"
          label={t("auth.username")}
          placeholder={t("auth.usernamePlaceholder")}
          startIcon="at-circle-outline"
        />

        <FormInput
          control={control}
          name="email"
          label={t("auth.email")}
          placeholder={t("auth.emailPlaceholder")}
          startIcon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <FormInput
          control={control}
          name="password"
          label={t("auth.password")}
          placeholder={t("auth.passwordPlaceholder")}
          secureTextEntry
          startIcon="lock-closed-outline"
        />

        {/* Password requirements checklist */}
        <View
          className="mb-4 rounded-2xl p-3"
          style={{ backgroundColor: `${colors.primary}10` }}
        >
          <View className="mb-1.5 flex-row items-center gap-1.5">
            <Text
              className="font-fredokaSemiBold text-xs"
              style={{ color: colors.primary }}
            >
              {t("auth.passwordRequirements.title")}
            </Text>
          </View>
          {passwordRules.map((rule) => (
            <View key={rule.key} className="flex-row items-center gap-2 py-0.5">
              <Ionicons
                name={rule.ok ? "checkmark-circle" : "ellipse-outline"}
                size={14}
                color={rule.ok ? colors.primary : colors.iconInactive}
              />
              <Text
                className="font-fredoka text-xs"
                style={{
                  color: rule.ok ? colors.primaryText : colors.mutedText,
                }}
              >
                {rule.label}
              </Text>
            </View>
          ))}
        </View>

        <FormInput
          control={control}
          name="confirmPassword"
          label={t("auth.confirmPassword")}
          placeholder={t("auth.confirmPasswordPlaceholder")}
          secureTextEntry
          startIcon="lock-closed-outline"
        />

        <LoadingButton
          onPress={handleNext}
          isLoading={false}
          label={t("auth.next")}
        />
      </View>

      {/* Step 2 fields — always mounted, hidden when on step 1 */}
      <View style={{ display: step === 2 ? "flex" : "none" }}>
        <PickerProvider>
          <FormInput
            control={control}
            name="fullName"
            label={t("auth.fullName")}
            placeholder={t("auth.fullNamePlaceholder")}
            startIcon="person-circle-outline"
          />

          <FormInput
            control={control}
            name="age"
            label={t("auth.age")}
            placeholder={t("auth.agePlaceholder")}
            keyboardType="number-pad"
            startIcon="calendar-outline"
          />

          <FormPicker
            control={control}
            name="gender"
            label={t("auth.gender")}
            placeholder={t("auth.genderPlaceholder")}
            options={[
              { label: t("auth.genderMale"), value: "male" },
              { label: t("auth.genderFemale"), value: "female" },
              { label: t("auth.genderOther"), value: "other" },
            ]}
            startIcon="body-outline"
          />

          <FormPicker
            control={control}
            name="grade"
            label={t("auth.grade")}
            placeholder={t("auth.gradePlaceholder")}
            options={[
              { label: t("auth.gradePrimary"), value: "primary" },
              { label: t("auth.gradeSecondary1"), value: "secondary 1" },
              { label: t("auth.gradeSecondary2"), value: "secondary 2" },
              { label: t("auth.gradeSecondary3"), value: "secondary 3" },
              { label: t("auth.gradeSecondary4"), value: "secondary 4" },
              { label: t("auth.gradeSecondary5"), value: "secondary 5" },
              { label: t("auth.gradeSecondary6"), value: "secondary 6" },
              { label: t("auth.gradePostSecondary"), value: "post-secondary" },
            ]}
            startIcon="school-outline"
          />

          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setStep(1)}
              className="mt-4 h-14 flex-1 items-center justify-center rounded-2xl border-2 active:opacity-70"
              style={{ borderColor: colors.primary }}
            >
              <Text
                className="font-fredokaSemiBold text-base"
                style={{ color: colors.primary }}
              >
                {t("auth.back")}
              </Text>
            </Pressable>

            <View className="flex-1">
              <LoadingButton
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                isLoading={isLoading}
                label={t("auth.register")}
              />
            </View>
          </View>
        </PickerProvider>
      </View>
    </View>
  );
}
