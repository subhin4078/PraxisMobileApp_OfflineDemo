import i18n, { Language, SupportedLanguages } from "@/src/i18n";
import { getItem, setItem } from "@/src/utils/storage";
import { useCallback, useEffect } from "react";
import { create } from "zustand";

interface LanguageState {
  language: Language;
  initialized: boolean;
  setInitialized: () => void;
  setLanguage: (language: Language) => void;
}

const useLanguageStore = create<LanguageState>((set) => ({
  language: Language.EN,
  initialized: false,
  setInitialized: () => set({ initialized: true }),
  setLanguage: (language: Language) => set({ language }),
}));

export default function useLanguage() {
  const {
    language,
    setLanguage: setLanguageStore,
    initialized,
    setInitialized,
  } = useLanguageStore();

  // Init: sync store with storage
  useEffect(() => {
    if (!initialized) {
      setInitialized();
      (async () => {
        const saved = await getItem<Language>("language");
        if (saved && SupportedLanguages.includes(saved)) {
          // use saved language if supported
          i18n.changeLanguage(saved);
          setLanguageStore(saved);
        } else if (
          i18n.language &&
          SupportedLanguages.includes(i18n.language as Language)
        ) {
          // use i18n detected language if supported
          setLanguageStore(i18n.language as Language);
          await setItem("language", i18n.language);
        } else {
          // default to English
          i18n.changeLanguage(Language.EN);
          setLanguageStore(Language.EN);
          await setItem("language", Language.EN);
        }
      })();
    }
  }, [initialized, setLanguageStore, setInitialized]);

  const setLanguage = useCallback(
    async (lang: Language) => {
      i18n.changeLanguage(lang);
      setLanguageStore(lang);
      await setItem("language", lang);
    },
    [setLanguageStore],
  );

  return {
    language,
    initialized,
    setLanguage,
  };
}
