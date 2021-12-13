import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { join } from "path";
import { readdirSync, lstatSync } from "fs";

const localesDir = join(__dirname, "./locales");

i18next.use(Backend).init({
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

export default (lng) => i18next.getFixedT(lng || "en");
