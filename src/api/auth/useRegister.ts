import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/stores/useAuthStore";
import useUserStore from "@/src/stores/useUserStore";
import { registerResponseSchema } from "@/src/types/api";
import { RegisterFormData } from "@/src/types/form";
import { setItem } from "@/src/utils/storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export function useRegister() {
  const router = useRouter();
  const { t } = useTranslation();
  const { show: showToast } = useToast();
  const { setUser } = useUserStore();
  const { setAccessToken, setRefreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const { username, email, password, fullName, age, gender, grade } = data;
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
        personalInfo: {
          fullName,
          age: parseInt(age, 10),
          gender,
          grade,
        },
      });
      return registerResponseSchema.parse(res);
    },
    onSuccess: async (res, variables) => {
      const { userId, accessToken, refreshToken } = res;
      const { username, email } = variables;

      await setItem("refreshToken", refreshToken);
      await setItem("userId", userId);
      await setItem("username", username);
      await setItem("email", email);

      setUser(userId, username, email);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      router.replace("/(tabs)");
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.status === 409
          ? t("auth.errors.userExists")
          : t("auth.errors.registrationFailed");
      showToast(errorMessage, "error");
    },
    retry: false,
  });
}
