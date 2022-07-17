import countries from "locales/countries.json";
import locales from "locales/locales.json";
import timezones from "locales/timezones.json";

export default {
  Query: {
    getLocales() {
      return Object.entries(locales).map(([code, name]) => ({
        code: code.replace(/_/g, "-"),
        name,
      }));
    },
    getCountries() {
      return countries;
    },
    getTimeZones() {
      return Object.entries(timezones).map(([timeZone, offset]) => ({
        timeZone,
        offset,
      }));
    },
  },
};
