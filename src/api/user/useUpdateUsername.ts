import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import useUserStore from "@/src/stores/useUserStore";
import { getHttpStatus } from "@/src/utils/httpError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

interface UpdateUsernameData {
  username: string;
  password: string;
}

const updateUsername = async (
  userId: string,
  currentUsername: string,
  data: UpdateUsernameData,
): Promise<void> => {
  // Check if username is the same as current
  if (data.username === currentUsername) {
    throw new Error("SAME_VALUE");
  }

  // Send username with current password for verification
  await api.patch(`/users/${userId}/account`, {
    username: data.username,
    password: data.password,
  });
};

export const useUpdateUsername = (userId: string, currentUsername: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser, email } = useUserStore();

  return useMutation({
    mutationFn: (data: UpdateUsernameData) =>
      updateUsername(userId, currentUsername, data),
    onSuccess: (_, variables) => {
      // Update the user store with new username
      setUser(userId, variables.username, email!);

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["account", userId] });

      toast.show(t("account.updateSuccess"), "success");

      // Navigate back to account page
      router.back();
    },
    onError: (error: any) => {
      if (error.message === "SAME_VALUE") {
        toast.show(t("account.errors.sameUsername"), "error");
      } else if (getHttpStatus(error) === 401) {
        toast.show(t("account.errors.wrongPassword"), "error");
      } else {
        toast.show(t("account.errors.updateError"), "error");
      }
    },
  });
};
