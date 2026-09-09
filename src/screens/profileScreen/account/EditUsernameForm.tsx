import { useUpdateUsername } from "@/src/api/user/useUpdateUsername";
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

interface EditUsernameFormProps {
  currentUsername: string;
}

export function EditUsernameForm({ currentUsername }: EditUsernameFormProps) {
  const { t } = useTranslation();
  const { userId } = useUserStore();
  const { colors } = useTheme();
  const { mutate: updateUsername, isPending } = useUpdateUsername(
    userId!,
    currentUsername,
  );

  const schema = z.object({
    username: z
      .string()
      .trim()
      .min(3, { message: t("auth.errors.usernameMinLength") })
      .max(10, { message: t("auth.errors.usernameMaxLength") })
      .regex(/^[a-zA-Z0-9 ]+$/, {
        message: t("auth.errors.usernameFormat"),
      }),
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
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: currentUsername,
      password: "",
    },
  });

  const usernameValue = watch("username") ?? "";
  const usernameRules = [
    {
      key: "length",
      label: t("auth.usernameRequirements.length"),
      ok: usernameValue.trim().length >= 3 && usernameValue.trim().length <= 10,
    },
    {
      key: "chars",
      label: t("auth.usernameRequirements.chars"),
      ok: usernameValue.length > 0 && /^[a-zA-Z0-9 ]+$/.test(usernameValue),
    },
  ];

  const onSubmit = async (data: FormData) => {
    updateUsername(data);
  };

  const isLoading = isSubmitting || isPending;

  return (
    <View className="gap-5">
      <View className="rounded-2xl bg-surface p-4">
        <Text className="mb-2 font-fredokaSemiBold text-base text-primaryText">
          {t("account.editUsernameDescription")}
        </Text>
        <Text className="font-fredokaRegular text-sm text-secondaryText">
          {t("account.confirmWithPassword")}
        </Text>
      </View>

      <View className="gap-4">
        <FormInput
          control={control}
          name="username"
          label={t("account.newUsername")}
          placeholder={t("auth.usernamePlaceholder")}
          startIcon="person-outline"
        />

        {/* Username requirements checklist */}
        <View
          className="rounded-2xl p-3"
          style={{ backgroundColor: `${colors.primary}10` }}
        >
          <View className="mb-1.5 flex-row items-center gap-1.5">
            <Text
              className="font-fredokaSemiBold text-xs"
              style={{ color: colors.primary }}
            >
              {t("auth.usernameRequirements.title")}
            </Text>
          </View>
          {usernameRules.map((rule) => (
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
