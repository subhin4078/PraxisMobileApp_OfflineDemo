import logger from "@/src/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

type StorageKey =
  | "theme"
  | "language"
  | "refreshToken"
  | "userId"
  | "username"
  | "email"
  | "equippedSkin"
  | `lastSeenRankIndex:${string}`
  | "seenFishIds";

const sensitiveKeys = new Set<StorageKey>([
  "refreshToken",
  "userId",
  "username",
  "email",
]);

export const setItem = async <T>(key: StorageKey, value: T): Promise<void> => {
  try {
    const stringValue = JSON.stringify(value);

    if (sensitiveKeys.has(key)) {
      await SecureStore.setItemAsync(key, stringValue);
      logger.debug(`[storage] Stored '${key}' in SecureStore`);
    } else {
      await AsyncStorage.setItem(key, stringValue);
      logger.debug(`[storage] Stored '${key}' in AsyncStorage`);
    }
  } catch (e) {
    logger.error(`[storage] setItem failed for ${key}:`, String(e));
    throw e;
  }
};

export const getItem = async <T>(key: StorageKey): Promise<T | null> => {
  try {
    let value: string | null = null;

    if (sensitiveKeys.has(key)) {
      value = await SecureStore.getItemAsync(key);
      logger.debug(`[storage] Retrieved '${key}' from SecureStore`);
    } else {
      value = await AsyncStorage.getItem(key);
      logger.debug(`[storage] Retrieved '${key}' from AsyncStorage`);
    }

    return value ? JSON.parse(value) : null;
  } catch (e) {
    logger.error(`[storage] getItem failed for ${key}:`, String(e));
    return null;
  }
};

export const removeItem = async (key: StorageKey): Promise<void> => {
  try {
    if (sensitiveKeys.has(key)) {
      await SecureStore.deleteItemAsync(key);
      logger.debug(`[storage] Removed '${key}' from SecureStore`);
    } else {
      await AsyncStorage.removeItem(key);
      logger.debug(`[storage] Removed '${key}' from AsyncStorage`);
    }
  } catch (e) {
    logger.error(`[storage] removeItem failed for ${key}:`, String(e));
  }
};

export const clearSensitive = async (): Promise<void> => {
  await Promise.all(
    Array.from(sensitiveKeys).map((key) =>
      SecureStore.deleteItemAsync(key).catch(() => {}),
    ),
  );
  logger.debug("[storage] Cleared all items from SecureStore");
};

export const clearAll = async (): Promise<void> => {
  await AsyncStorage.clear().catch(() => {});
  logger.debug("[storage] Cleared all items from AsyncStorage");

  await clearSensitive();
};
