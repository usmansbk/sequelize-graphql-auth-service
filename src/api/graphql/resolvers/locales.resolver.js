import countries from "locales/countries.json";
import locales from "locales/locales.json";
import timezones from "locales/timezones.json";

export default {
  Query: {
    getLocales() {
      return locales;
    },
    getCountries() {
      return countries;
    },
    getTimeZones() {
      return timezones;
    },
  },
};
