import logger from "@/src/utils/logger";
import { format } from "date-fns";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    logger.error("Failed to decode token:", String(error));
    return true;
  }
}

export function getTokenExpiryTime(token: string | null): string | null {
  if (!token) return null;
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return format(new Date(decoded.exp * 1000), "yyyy-MM-dd HH:mm:ss");
  } catch {
    return null;
  }
}
