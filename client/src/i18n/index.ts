import { createContext, useContext } from "react";
import fr from "./fr";
import en from "./en";

const translations = { fr, en } as const;

export type Language = keyof typeof translations;
export type TranslationKeys = typeof fr;

export function getTranslations(lang: Language): TranslationKeys {
  return translations[lang];
}

export const I18nContext = createContext<{
  lang: Language;
  t: TranslationKeys;
  setLang: (lang: Language) => void;
}>({
  lang: "fr",
  t: fr,
  setLang: () => {},
});

export function useT() {
  return useContext(I18nContext);
}

export function detectLanguage(): Language {
  if (typeof window === "undefined") return "fr";
  const stored = localStorage.getItem("lang");
  if (stored === "en" || stored === "fr") return stored;
  const browserLang = navigator.language?.slice(0, 2);
  if (browserLang === "en") return "en";
  return "fr";
}
