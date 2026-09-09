import useLanguage from "@/src/hooks/useLanguage";
import { Language } from "@/src/i18n";

const CHINESE_FONT = "Huninn_400Regular";

const FREDOKA_MAP: Record<string, string> = {
  Fredoka_400Regular: CHINESE_FONT,
  Fredoka_500Medium: CHINESE_FONT,
  Fredoka_600SemiBold: CHINESE_FONT,
  Fredoka_700Bold: CHINESE_FONT,
};

export default function useFontFamily() {
  const { language } = useLanguage();

  return (fontFamily: string) => {
    if (language === Language.ZH) {
      return FREDOKA_MAP[fontFamily] ?? fontFamily;
    }
    return fontFamily;
  };
}
