import { useUpdateProfile } from "@/src/api/user/useUpdateProfile";
import { FormInput } from "@/src/components/FormInput";
import { FormPicker } from "@/src/components/FormPicker";
import { LoadingButton } from "@/src/components/LoadingButton";
import { PickerProvider } from "@/src/components/PickerContext";
import useUserStore from "@/src/stores/useUserStore";
import { createEditProfileFormSchema } from "@/src/types/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { z } from "zod";

interface EditProfileFormProps {
  initialData?: {
    fullName: string;
    age: number;
    gender: string;
    grade: string;
    school?: string;
    bio?: string;
  };
}

export function EditProfileForm({ initialData }: EditProfileFormProps) {
  const { t } = useTranslation();
  const { userId } = useUserStore();
  const { mutate: updateProfile, isPending } = useUpdateProfile(userId!);
  const [isDelaying] = useState(false);

  const schema = createEditProfileFormSchema(t);
  type FormData = z.infer<typeof schema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      age: initialData?.age?.toString() || "",
      gender: initialData?.gender || "",
      grade: initialData?.grade || "",
      school: initialData?.school || "",
      bio: initialData?.bio || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    updateProfile({
      fullName: data.fullName,
      age: parseInt(data.age, 10),
      gender: data.gender,
      grade: data.grade,
      ...(data.school?.trim() && { school: data.school.trim() }),
      ...(data.bio?.trim() && { bio: data.bio.trim() }),
    });
  };

  const isLoading = isSubmitting || isPending || isDelaying;

  const genderOptions = [
    { label: t("profile.genderMale"), value: "male" },
    { label: t("profile.genderFemale"), value: "female" },
    { label: t("profile.genderOther"), value: "other" },
  ];

  const gradeOptions = [
    { label: t("auth.gradePrimary"), value: "primary" },
    { label: t("auth.gradeSecondary1"), value: "secondary 1" },
    { label: t("auth.gradeSecondary2"), value: "secondary 2" },
    { label: t("auth.gradeSecondary3"), value: "secondary 3" },
    { label: t("auth.gradeSecondary4"), value: "secondary 4" },
    { label: t("auth.gradeSecondary5"), value: "secondary 5" },
    { label: t("auth.gradeSecondary6"), value: "secondary 6" },
    { label: t("auth.gradePostSecondary"), value: "post-secondary" },
  ];

  return (
    <PickerProvider>
      <View className="gap-5">
        <FormInput
          control={control}
          name="bio"
          label={t("profile.introduction")}
          placeholder={t("profile.bioPlaceholder")}
          multiline
          numberOfLines={3}
          startIcon="create-outline"
        />

        <FormInput
          control={control}
          name="fullName"
          label={t("profile.fullName")}
          placeholder={t("profile.fullNamePlaceholder")}
          startIcon="person-outline"
        />

        <FormInput
          control={control}
          name="age"
          label={t("profile.age")}
          placeholder={t("profile.agePlaceholder")}
          keyboardType="numeric"
          startIcon="calendar-outline"
        />

        <FormPicker
          control={control}
          name="gender"
          label={t("profile.gender")}
          placeholder={t("profile.genderPlaceholder")}
          options={genderOptions}
          startIcon="body-outline"
        />

        <FormPicker
          control={control}
          name="grade"
          label={t("profile.grade")}
          placeholder={t("profile.gradePlaceholder")}
          options={gradeOptions}
          startIcon="school-outline"
        />

        <FormInput
          control={control}
          name="school"
          label={t("profile.school")}
          placeholder={t("profile.schoolPlaceholder")}
          startIcon="business-outline"
        />

        <LoadingButton
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          isLoading={isLoading}
          label={t("profile.saveChanges")}
        />
      </View>
    </PickerProvider>
  );
}
