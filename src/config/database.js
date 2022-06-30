import dotenv from "dotenv";
import logger from "~utils/logger";

dotenv.config();

const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  DB_NAME_TEST,
  DB_HOST,
  DB_DIALECT,
  DB_PORT,
} = process.env;

const dialect = DB_DIALECT;
const host = DB_HOST;

export default {
  development: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    host,
    dialect,
    logging: (msg) => logger.info(msg),
  },
  test: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME_TEST,
    port: DB_PORT,
    host,
    dialect,
    logging: false,
  },
  production: {
    dialect,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    use_env_variable: "DATABASE_URL",
    logging: (...msg) => logger.info(msg),
  },
};
