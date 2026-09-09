import { useToast } from "@/src/hooks/useToast";
import { useAuthStore } from "@/src/stores/useAuthStore";
import useUserStore from "@/src/stores/useUserStore";
import { clearSensitive } from "@/src/utils/storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export function useLogout() {
  const router = useRouter();
  const { t } = useTranslation();
  const { show: showToast } = useToast();
  const { resetUser } = useUserStore();
  const { setAccessToken, setRefreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      // Clear auth state
      setAccessToken(null);
      setRefreshToken(null);
      resetUser();

      // Clear sensitive storage
      await clearSensitive();
    },
    onSuccess: () => {
      showToast(t("auth.logoutSuccess"), "success");
      router.replace("/other/welcome");
    },
    onError: () => {
      showToast(t("auth.errors.logoutFailed"), "error");
    },
  });
}
