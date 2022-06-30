import logger from "~utils/logger";

const { DB_USERNAME, DB_PASSWORD, DB_NAME, DB_HOST, DB_DIALECT, DB_PORT } =
  process.env;

const username = DB_USERNAME;
const password = DB_PASSWORD;
const database = DB_NAME;
const port = DB_PORT;
const dialect = DB_DIALECT;
const host = DB_HOST;

const dbConfig = {
  username,
  password,
  database,
  port,
  host,
  dialect,
};

export const development = {
  ...dbConfig,
  logging: (msg) => logger.info(msg),
};

export const test = {
  ...dbConfig,
  logging: false,
};

export const production = {
  dialect,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  use_env_variable: "DATABASE_URL",
  logging: (...msg) => logger.info(msg),
};

export default {
  development,
  test,
  production,
};
