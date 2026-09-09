import { useUpdateEmail } from "@/src/api/user/useUpdateEmail";
import { FormInput } from "@/src/components/FormInput";
import { LoadingButton } from "@/src/components/LoadingButton";
import useUserStore from "@/src/stores/useUserStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { z } from "zod";

interface EditEmailFormProps {
  currentEmail: string;
}

export function EditEmailForm({ currentEmail }: EditEmailFormProps) {
  const { t } = useTranslation();
  const { userId } = useUserStore();
  const { mutate: updateEmail, isPending } = useUpdateEmail(
    userId!,
    currentEmail,
  );

  const schema = z.object({
    email: z
      .string()
      .trim()
      .min(1, {
        message: t("common.fieldRequired", { field: t("auth.email") }),
      })
      .email(t("auth.errors.invalidEmail")),
    password: z
      .string()
      .trim()
      .min(8, {
        message: t("auth.errors.passwordMinLength"),
      }),
  });

  type FormData = z.infer<typeof schema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: currentEmail,
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    updateEmail(data);
  };

  const isLoading = isSubmitting || isPending;

  return (
    <View className="gap-5">
      <View className="rounded-2xl bg-surface p-4">
        <Text className="mb-2 font-fredokaSemiBold text-base text-primaryText">
          {t("account.editEmailDescription")}
        </Text>
        <Text className="font-fredokaRegular text-sm text-secondaryText">
          {t("account.confirmWithPassword")}
        </Text>
      </View>

      <View className="gap-4">
        <FormInput
          control={control}
          name="email"
          label={t("account.newEmail")}
          placeholder={t("auth.emailPlaceholder")}
          keyboardType="email-address"
          autoCapitalize="none"
          startIcon="mail-outline"
        />

        <FormInput
          control={control}
          name="password"
          label={t("account.currentPassword")}
          placeholder={t("auth.passwordPlaceholder")}
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
