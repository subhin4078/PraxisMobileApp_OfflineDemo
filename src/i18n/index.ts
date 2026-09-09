import en from "@/src/i18n/locales/en.json";
import zh from "@/src/i18n/locales/zh-hk.json";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export enum Language {
  EN = "en",
  ZH = "zh",
}
export const SupportedLanguages = Object.values(Language);

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng: "en", // Default to English; overridden by saved preference on app init
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
