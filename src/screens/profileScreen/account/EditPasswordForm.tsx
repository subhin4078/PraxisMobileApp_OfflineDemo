import { useUpdatePassword } from "@/src/api/user/useUpdatePassword";
import { FormInput } from "@/src/components/FormInput";
import { LoadingButton } from "@/src/components/LoadingButton";
import useTheme from "@/src/hooks/useTheme";
import useUserStore from "@/src/stores/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { z } from "zod";

export function EditPasswordForm() {
  const { t } = useTranslation();
  const { userId } = useUserStore();
  const { colors } = useTheme();
  const { mutate: updatePassword, isPending } = useUpdatePassword(userId!);

  const schema = z
    .object({
      newPassword: z
        .string()
        .trim()
        .min(8, {
          message: t("auth.errors.passwordMinLength"),
        })
        .max(64, { message: t("auth.errors.passwordMaxLength") })
        .regex(/^[a-zA-Z0-9 !@#$%^&*()\-_=+?\[\]{}|,.;:]+$/, {
          message: t("auth.errors.passwordFormat"),
        })
        .regex(/[A-Z]/, { message: t("auth.errors.passwordUppercase") })
        .regex(/[a-z]/, { message: t("auth.errors.passwordLowercase") })
        .regex(/[0-9]/, { message: t("auth.errors.passwordNumber") }),
      confirmPassword: z
        .string()
        .trim()
        .min(1, {
          message: t("common.fieldRequired", {
            field: t("account.confirmNewPassword"),
          }),
        }),
      currentPassword: z
        .string()
        .trim()
        .min(8, {
          message: t("auth.errors.passwordMinLength"),
        }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("auth.errors.passwordMismatch"),
      path: ["confirmPassword"],
    });

  type FormData = z.infer<typeof schema>;

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
      currentPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword") ?? "";
  const passwordRules = [
    {
      key: "length",
      label: t("auth.passwordRequirements.length"),
      ok: newPasswordValue.length >= 8 && newPasswordValue.length <= 64,
    },
    {
      key: "upper",
      label: t("auth.passwordRequirements.uppercase"),
      ok: /[A-Z]/.test(newPasswordValue),
    },
    {
      key: "lower",
      label: t("auth.passwordRequirements.lowercase"),
      ok: /[a-z]/.test(newPasswordValue),
    },
    {
      key: "num",
      label: t("auth.passwordRequirements.number"),
      ok: /[0-9]/.test(newPasswordValue),
    },
    {
      key: "chars",
      label: t("auth.passwordRequirements.chars"),
      ok:
        newPasswordValue.length > 0 &&
        /^[a-zA-Z0-9 !@#$%^&*()\-_=+?\[\]{}|,.;:]+$/.test(newPasswordValue),
    },
  ];

  const onSubmit = async (data: FormData) => {
    updatePassword({
      newPassword: data.newPassword,
      currentPassword: data.currentPassword,
    });
  };

  const isLoading = isSubmitting || isPending;

  return (
    <View className="gap-5">
      <View className="rounded-2xl bg-surface p-4">
        <Text className="mb-2 font-fredokaSemiBold text-base text-primaryText">
          {t("account.editPasswordDescription")}
        </Text>
        <Text className="font-fredokaRegular text-sm text-secondaryText">
          {t("account.enterNewPassword")}
        </Text>
      </View>

      <View className="gap-4">
        <FormInput
          control={control}
          name="newPassword"
          label={t("account.newPassword")}
          placeholder={t("account.newPasswordPlaceholder")}
          secureTextEntry
          startIcon="lock-closed-outline"
        />

        {/* Password requirements checklist */}
        <View
          className="rounded-2xl p-3"
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
          label={t("account.confirmNewPassword")}
          placeholder={t("account.confirmNewPasswordPlaceholder")}
          secureTextEntry
          startIcon="lock-closed-outline"
        />

        <FormInput
          control={control}
          name="currentPassword"
          label={t("account.currentPassword")}
          placeholder={t("account.currentPasswordPlaceholder")}
          secureTextEntry
          startIcon="lock-closed-outline"
        />

        <LoadingButton
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          label={t("account.saveChanges")}
        />
      </View>
    </View>
  );
}
