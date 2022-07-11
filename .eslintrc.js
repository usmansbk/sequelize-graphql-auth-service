module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["airbnb-base", "prettier"],
  parserOptions: {
    ecmaVersion: 13,
    sourceType: "module",
  },
  rules: {},
  settings: {
    "import/resolver": {
      alias: {
        map: [
          ["~config", "./src/config"],
          ["~api", "./src/api"],
          ["~utils", "./src/utils"],
          ["~services", "./src/services"],
          ["~db", "./src/db"],
          ["~scripts", "./src/scripts"],
          ["~helpers", "./src/helpers"],
          ["~constants", "./src/constants"],
          ["tests", "./tests"],
          ["locales", "./locales"],
        ],
        extensions: [".ts", ".js", ".json"],
      },
    },
  },
};
