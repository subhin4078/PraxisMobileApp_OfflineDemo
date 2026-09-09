import { getTokenExpiryTime, isTokenExpired } from "@/src/utils/jwt";
import { create } from "zustand";

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  clearAuth: () => void;
  isAccessTokenExpired: () => boolean;
  isRefreshTokenExpired: () => boolean;
  getAccessTokenExpiryTime: () => string | null; // for debugging
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  setRefreshToken: (token) => set({ refreshToken: token }),
  clearAuth: () => set({ accessToken: null, refreshToken: null }),
  isAccessTokenExpired: () => isTokenExpired(get().accessToken),
  isRefreshTokenExpired: () => isTokenExpired(get().refreshToken),
  getAccessTokenExpiryTime: () => getTokenExpiryTime(get().accessToken),
}));
