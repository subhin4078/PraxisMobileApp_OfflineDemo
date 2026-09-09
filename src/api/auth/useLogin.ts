import { authenticateLocalUser } from "@/src/api/mock/localApi";
import { useToast } from "@/src/hooks/useToast";
import { useAuthStore } from "@/src/stores/useAuthStore";
import useUserStore from "@/src/stores/useUserStore";
import {
  getHttpErrorMessage,
  getHttpStatus,
  isNetworkOfflineError,
} from "@/src/utils/httpError";
import { setItem } from "@/src/utils/storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export function useLogin() {
  const router = useRouter();
  const { t } = useTranslation();
  const { show: showToast } = useToast();
  const { setUser } = useUserStore();
  const { setAccessToken, setRefreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      userNameOrEmail,
      password,
    }: {
      userNameOrEmail: string;
      password: string;
    }) => {
      try {
        return await authenticateLocalUser(userNameOrEmail.trim(), password);
      } catch {
        const error = new Error("Invalid credentials") as Error & {
          response?: { status: number };
        };
        error.response = { status: 401 };
        throw error;
      }
    },
    onSuccess: async (res) => {
      const { userId, username, email, accessToken, refreshToken } = res;
      await setItem("refreshToken", refreshToken);
      await setItem("userId", userId);
      await setItem("username", username);
      await setItem("email", email);
      setUser(userId, username, email);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      router.replace("/(tabs)");
    },
    onError: (err) => {
      if (isNetworkOfflineError(err)) {
        showToast(t("auth.errors.loginOffline"), "error");
        return;
      }

      const status = getHttpStatus(err);

      if (status === 401) {
        showToast(t("auth.errors.loginInvalidCredentials"), "error");
        return;
      }

      if (status === 400) {
        showToast(t("auth.errors.loginBadRequest"), "error");
        return;
      }

      if (status === 429) {
        showToast(t("auth.errors.loginTooManyAttempts"), "error");
        return;
      }

      showToast(getHttpErrorMessage(status, t), "error");
    },
    retry: false,
  });
}
