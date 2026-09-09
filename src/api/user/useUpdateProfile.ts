import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

interface UpdateProfilePayload {
  fullName: string;
  age: number;
  gender: string;
  grade: string;
  school?: string;
  bio?: string;
}

export function useUpdateProfile(userId: string) {
  const router = useRouter();
  const { t } = useTranslation();
  const { show: showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfilePayload) => {
      await api.patch(`/users/${userId}/profile`, {
        personalInfo: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      showToast(t("profile.updateSuccess"), "success");
      router.back();
    },
    onError: () => {
      showToast(t("profile.errors.updateFailed"), "error");
    },
  });
}
