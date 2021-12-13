import i18next from "i18next";
import en from "./locales/en/translation";

export const loadTranslations = () =>
  i18next.init({
    fallbackLng: "en",
    debug: false,
    resources: {
      en: {
        translation: en,
      },
    },
  });

export const getTranslation = (lng) => i18next.getFixedT(lng || "en");
