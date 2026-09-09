import { LOCAL_TOKEN } from "@/src/api/mock/localApi";
import { USE_LOCAL_API } from "@/src/lib/appMode";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { refreshTokenResponseSchema } from "@/src/types/api";
import logger from "@/src/utils/logger";
import { setItem } from "@/src/utils/storage";
import axios from "axios";

const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL;

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  if (USE_LOCAL_API || !serverUrl) {
    const { setAccessToken } = useAuthStore.getState();
    setAccessToken(LOCAL_TOKEN);
    return LOCAL_TOKEN;
  }

  // Prevent multiple simultaneous refresh requests
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const { refreshToken } = useAuthStore.getState();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      logger.debug("Refreshing access token...");

      const res = await axios.post(
        `${serverUrl}/api/auth/token`,
        { refreshToken },
        {
          timeout: 20000,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );
      const parsed = refreshTokenResponseSchema.parse(res.data);

      const { setAccessToken } = useAuthStore.getState();
      setAccessToken(parsed.accessToken);

      logger.debug("Access token refreshed successfully");

      return parsed.accessToken;
    } catch (error) {
      logger.error("Failed to refresh access token:", String(error));
      // Clear auth state on refresh failure
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      await setItem("refreshToken", null);
      await setItem("userId", null);
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
