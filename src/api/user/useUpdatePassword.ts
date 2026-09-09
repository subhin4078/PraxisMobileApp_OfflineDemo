import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import { getHttpStatus } from "@/src/utils/httpError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

interface UpdatePasswordData {
  newPassword: string;
  currentPassword: string;
}

const updatePassword = async (
  userId: string,
  data: UpdatePasswordData,
): Promise<void> => {
  // Check if new password is the same as current
  if (data.newPassword === data.currentPassword) {
    throw new Error("SAME_VALUE");
  }

  // Send new password with current password for verification
  await api.patch(`/users/${userId}/account`, {
    newPassword: data.newPassword,
    password: data.currentPassword,
  });
};

export const useUpdatePassword = (userId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdatePasswordData) => updatePassword(userId, data),
    onSuccess: () => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["account", userId] });

      toast.show(t("account.passwordUpdateSuccess"), "success");

      // Navigate back to account page
      router.back();
    },
    onError: (error: any) => {
      if (error.message === "SAME_VALUE") {
        toast.show(t("account.errors.samePassword"), "error");
      } else if (getHttpStatus(error) === 401) {
        toast.show(t("account.errors.wrongPassword"), "error");
      } else {
        toast.show(t("account.errors.updateError"), "error");
      }
    },
  });
};
