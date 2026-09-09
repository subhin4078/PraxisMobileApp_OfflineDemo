import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import useUserStore from "@/src/stores/useUserStore";
import { getHttpStatus } from "@/src/utils/httpError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface UpdateAccountData {
  username: string;
  email: string;
  password: string;
}

const updateAccount = async (
  userId: string,
  data: UpdateAccountData,
): Promise<void> => {
  await api.patch(`/users/${userId}/account`, data);
};

export const useUpdateAccount = (userId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (data: UpdateAccountData) => updateAccount(userId, data),
    onSuccess: (_, variables) => {
      // Update the user store with new username and email
      setUser(userId, variables.username, variables.email);

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["account", userId] });

      toast.show(t("account.updateSuccess"), "success");
    },
    onError: (error: any) => {
      if (getHttpStatus(error) === 401) {
        toast.show(t("account.errors.wrongPassword"), "error");
      } else {
        toast.show(t("account.errors.updateError"), "error");
      }
    },
  });
};
