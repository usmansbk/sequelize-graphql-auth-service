import countries from "~helpers/constants/countries";
import locales from "~helpers/constants/locales.json";
import timezones from "~helpers/constants/timezones.json";

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
