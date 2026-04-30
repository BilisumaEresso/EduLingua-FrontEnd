import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import enTranslation from "./locales/en/translation.json";
import amTranslation from "./locales/am/translation.json";
import omTranslation from "./locales/om/translation.json";
import swTranslation from "./locales/sw/translation.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  am: {
    translation: amTranslation,
  },
  om: {
    translation: omTranslation,
  },
  sw: {
    translation: swTranslation,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("userNativeLang") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already handles XSS
  },
});

export default i18n;
