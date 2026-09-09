import { refreshAccessToken } from "@/src/api/auth/useRefreshToken";
import { localApiAdapter } from "@/src/api/mock/localApi";
import { USE_LOCAL_API } from "@/src/lib/appMode";
import { useAuthStore } from "@/src/stores/useAuthStore";
import logger from "@/src/utils/logger";
import axios from "axios";

const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL;

const api = axios.create({
  baseURL: USE_LOCAL_API ? undefined : serverUrl?.replace(/\/$/, "") + "/api",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  adapter: USE_LOCAL_API ? localApiAdapter : undefined,
});

api.interceptors.request.use(
  async (config) => {
    const { accessToken, isAccessTokenExpired } = useAuthStore.getState();

    // Skip token refresh for auth endpoints
    if (
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register") ||
      config.url?.includes("/auth/token")
    ) {
      if (accessToken)
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      return config;
    }

    // Check if access token is expired and refresh if needed
    if (accessToken && isAccessTokenExpired()) {
      try {
        const newAccessToken = await refreshAccessToken();
        config.headers["Authorization"] = `Bearer ${newAccessToken}`;
      } catch (error) {
        logger.error(
          "Token refresh failed in request interceptor:",
          String(error),
        );
        return Promise.reject(error);
      }
    } else if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    // API response logging & parsing
    logger.debug(
      `${response.config?.method?.toUpperCase()} ${response.config?.url} ${response.status} - `,
      JSON.stringify(response.data, null, 2),
    );
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - token might be expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/token") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        logger.error(
          "Token refresh failed in response interceptor:",
          String(refreshError),
        );
        return Promise.reject(refreshError);
      }
    }

    // Global error handling
    logger.error(
      `${error.config?.method?.toUpperCase()} ${error.config?.url} ${error.status} - `,
      error.response
        ? JSON.stringify(error.response?.data, null, 2)
        : error.message,
    );
    return Promise.reject(error);
  },
);

export default api;
