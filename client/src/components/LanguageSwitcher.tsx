import { useT } from "../i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useT();
  return (
    <button
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      className="text-xs px-2 py-1 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition flex items-center gap-1"
      title={lang === "fr" ? "Switch to English" : "Passer en français"}
    >
      <span className={`${lang === "fr" ? "text-blue-400" : "text-gray-600"}`}>FR</span>
      <span className="text-gray-600">/</span>
      <span className={`${lang === "en" ? "text-blue-400" : "text-gray-600"}`}>EN</span>
    </button>
  );
}
