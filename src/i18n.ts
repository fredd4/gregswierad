import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import pl from "./locales/pl.json";
import es from "./locales/es.json";

const resources = {
  en: { translation: en },
  pl: { translation: pl },
  es: { translation: es },
};

// The URL decides the language (see src/content/routes.ts): src/main.tsx and the
// prerender call changeLanguage() before rendering, so server and browser markup match.
// Resources are bundled, so init and changeLanguage finish synchronously.
i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  supportedLngs: ["en", "pl", "es"],
  load: "languageOnly",
  initAsync: false,
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export default i18n;
