const { DB_USERNAME, DB_NAME } = process.env;

const dialect = "postgres";
const host = "127.0.0.1";

export default {
  development: {
    username: DB_USERNAME,
    password: null,
    database: DB_NAME,
    host,
    dialect,
  },
  test: {
    username: DB_USERNAME,
    password: null,
    database: DB_NAME,
    host,
    dialect,
  },
  production: {
    username: DB_USERNAME,
    password: null,
    database: DB_NAME,
    host,
    dialect,
  },
};
