import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const SETTINGS_KEY = "app_settings";

interface SettingsStore {
  bgmEnabled: boolean;
  bgmVolume: number;
  sfxEnabled: boolean;
  sfxVolume: number;
  vibrationEnabled: boolean;
  hydrated: boolean;
  setBgmEnabled: (enabled: boolean) => void;
  setBgmVolume: (volume: number) => void;
  setSfxEnabled: (enabled: boolean) => void;
  setSfxVolume: (volume: number) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  hydrate: () => Promise<void>;
}

const persist = (state: Partial<SettingsStore>) => {
  const { bgmEnabled, bgmVolume, sfxEnabled, sfxVolume, vibrationEnabled } =
    useSettingsStore.getState();
  const merged = {
    bgmEnabled,
    bgmVolume,
    sfxEnabled,
    sfxVolume,
    vibrationEnabled,
    ...state,
  };
  void AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  bgmEnabled: true,
  bgmVolume: 1,
  sfxEnabled: true,
  sfxVolume: 1,
  vibrationEnabled: true,
  hydrated: false,

  setBgmEnabled: (enabled) => {
    set({ bgmEnabled: enabled });
    persist({ bgmEnabled: enabled });
  },
  setBgmVolume: (volume) => {
    set({ bgmVolume: volume });
    persist({ bgmVolume: volume });
  },
  setSfxEnabled: (enabled) => {
    set({ sfxEnabled: enabled });
    persist({ sfxEnabled: enabled });
  },
  setSfxVolume: (volume) => {
    set({ sfxVolume: volume });
    persist({ sfxVolume: volume });
  },
  setVibrationEnabled: (enabled) => {
    set({ vibrationEnabled: enabled });
    persist({ vibrationEnabled: enabled });
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        set({
          bgmEnabled:
            typeof parsed.bgmEnabled === "boolean" ? parsed.bgmEnabled : true,
          bgmVolume:
            typeof parsed.bgmVolume === "number" ? parsed.bgmVolume : 1,
          sfxEnabled:
            typeof parsed.sfxEnabled === "boolean" ? parsed.sfxEnabled : true,
          sfxVolume:
            typeof parsed.sfxVolume === "number" ? parsed.sfxVolume : 1,
          vibrationEnabled:
            typeof parsed.vibrationEnabled === "boolean"
              ? parsed.vibrationEnabled
              : true,
        });
      }
    } catch {
      // Use defaults on error
    }
    set({ hydrated: true });
  },
}));
