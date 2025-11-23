import { useI18n } from '#imports';

export function useLanguage() {
  const { locale, setLocale } = useI18n()
  const currentLanguage = ref(locale.value)
  interface LangItem {
    code: "en" | "fr";
    name: string;
    flag: string;
  }
  const languages : LangItem[] = [
    { code: "fr", name: 'Français', flag: '🇫🇷' },
    { code: "en", name: 'English', flag: '🇬🇧' }
  ]

  const changeLanguage = (lang: "en" | "fr") => {
    setLocale(lang)
    currentLanguage.value = lang
  }

  return {
    currentLanguage,
    languages,
    changeLanguage
  }
}