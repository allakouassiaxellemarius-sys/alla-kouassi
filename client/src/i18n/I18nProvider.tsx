import { useState, useCallback, ReactNode } from "react";
import { I18nContext, getTranslations, detectLanguage, Language } from "./index";

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(detectLanguage);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  }, []);

  const t = getTranslations(lang);

  return (
    <I18nContext.Provider value={{ lang, t, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}
