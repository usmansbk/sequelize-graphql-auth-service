import countries from "~constants/countries";
import locales from "~constants/locales.json";
import timezones from "~constants/timezones.json";

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
