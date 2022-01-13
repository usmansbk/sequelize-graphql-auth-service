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
          ["~helpers", "./src/helpers"],
        ],
        extensions: [".ts", ".js", ".json"],
      },
    },
  },
};
