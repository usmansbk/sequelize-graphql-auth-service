import i18next from "i18next";
import en from "./locales/en";

i18next.init({
  fallbackLng: "en",
  debug: process.env.NODE_ENV === "development",
  resources: {
    en: {
      translation: en,
    },
  },
});

export default (lng) => i18next.getFixedT(lng || "en");
