require("dotenv").config();

const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME_DEV,
  DB_NAME_TEST,
  DB_HOST,
  DB_DIALECT,
} = process.env;

const dialect = DB_DIALECT;
const host = DB_HOST;

module.exports = {
  development: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME_DEV,
    host,
    dialect,
  },
  test: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME_TEST,
    host,
    dialect,
  },
  production: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    host,
    dialect,
  },
};
