import countries from "~constants/countries";
import locales from "~constants/locales.json";

export default {
  Query: {
    getLocales() {
      return locales;
    },
    getCountries() {
      return countries;
    },
  },
};
