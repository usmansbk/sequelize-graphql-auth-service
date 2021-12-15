import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import { join, resolve } from "path";
import { readdirSync, lstatSync } from "fs";

const localesDir = resolve("locales");

i18next
  .use(middleware.LanguageDetector)
  .use(Backend)
  .init({
    initImmediate: false,
    fallbackLng: "en",
    preload: readdirSync(localesDir).filter((fileName) => {
      const joinedPath = join(localesDir, fileName);
      return lstatSync(joinedPath).isDirectory();
    }),
    backend: {
      loadPath: join(localesDir, "{{lng}}/{{ns}}.json"),
    },
  });

export const useLanguageMiddleware = (app) => {
  app.use(middleware.handle(i18next));
};

export default (lng) => i18next.getFixedT(lng);
