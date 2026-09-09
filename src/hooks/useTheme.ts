import Themes from "@/src/constants/theme";
import { getItem, setItem } from "@/src/utils/storage";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect } from "react";
import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  initialized: boolean;
  setInitialized: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const useThemeStore = create<ThemeState>((set) => ({
  theme: "light", // Default to light mode; overridden by saved preference on init
  initialized: false,
  setInitialized: () => set({ initialized: true }),
  setTheme: (theme: Theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
}));

export default function useTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const {
    theme,
    setTheme: setThemeStore,
    initialized,
    setInitialized,
  } = useThemeStore();

  // Init: sync store with nativewind and storage
  useEffect(() => {
    if (!initialized) {
      setInitialized();
      (async () => {
        const saved = await getItem<Theme>("theme");
        if (saved === "light" || saved === "dark") {
          // Use saved theme if valid
          setColorScheme(saved);
          setThemeStore(saved);
        } else {
          // Default to light mode (app default)
          setColorScheme("light");
          setThemeStore("light");
          await setItem("theme", "light");
        }
      })();
    }
  }, [initialized, setThemeStore, setColorScheme, setInitialized]);

  const setTheme = useCallback(
    async (t: Theme) => {
      setThemeStore(t);
      setColorScheme(t);
      await setItem("theme", t);
    },
    [setThemeStore, setColorScheme],
  );

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeStore(newTheme);
    setColorScheme(newTheme);
    await setItem("theme", newTheme);
  }, [theme, setThemeStore, setColorScheme]);

  return {
    theme: theme || colorScheme || "light",
    setTheme,
    toggleTheme,
    initialized,
    colors: Themes[theme || colorScheme || "light"],
  };
}
