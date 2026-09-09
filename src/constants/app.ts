export const APP_CONFIG = {
  version: "0.9.80 Beta",
  /** true in Expo / Metro dev builds, false in production */
  IS_DEV: __DEV__ ?? false,
} as const;
