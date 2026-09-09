import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/stores/useAuthStore";
import useUserStore from "@/src/stores/useUserStore";
import { clearSensitive } from "@/src/utils/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

const deleteAccount = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`);
};

export const useDeleteAccount = (userId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { resetUser } = useUserStore();

  return useMutation({
    mutationFn: () => deleteAccount(userId),
    onSuccess: async () => {
      // Clear all cached data
      queryClient.clear();

      // Clear auth and user state
      clearAuth();
      resetUser();

      // Clear sensitive storage (refreshToken and userId)
      await clearSensitive();

      // Show success message
      toast.show(t("account.deleteSuccess"), "success");

      // Navigate to welcome screen
      router.replace("/other/welcome");
    },
    onError: () => {
      toast.show(t("account.errors.deleteFailed"), "error");
    },
  });
};
