import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import useUserStore from "@/src/stores/useUserStore";
import { getHttpStatus } from "@/src/utils/httpError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

interface UpdateEmailData {
  email: string;
  password: string;
}

const updateEmail = async (
  userId: string,
  currentEmail: string,
  data: UpdateEmailData,
): Promise<void> => {
  // Check if email is the same as current
  if (data.email === currentEmail) {
    throw new Error("SAME_VALUE");
  }

  // Send email with current password for verification
  await api.patch(`/users/${userId}/account`, {
    email: data.email,
    password: data.password,
  });
};

export const useUpdateEmail = (userId: string, currentEmail: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser, username } = useUserStore();

  return useMutation({
    mutationFn: (data: UpdateEmailData) =>
      updateEmail(userId, currentEmail, data),
    onSuccess: (_, variables) => {
      // Update the user store with new email
      setUser(userId, username!, variables.email);

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["account", userId] });

      toast.show(t("account.updateSuccess"), "success");

      // Navigate back to account page
      router.back();
    },
    onError: (error: any) => {
      if (error.message === "SAME_VALUE") {
        toast.show(t("account.errors.sameEmail"), "error");
      } else if (getHttpStatus(error) === 401) {
        toast.show(t("account.errors.wrongPassword"), "error");
      } else {
        toast.show(t("account.errors.updateError"), "error");
      }
    },
  });
};
