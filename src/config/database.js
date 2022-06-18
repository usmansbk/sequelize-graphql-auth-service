require("dotenv").config();

const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME_DEV,
  DB_NAME_TEST,
  DB_HOST,
  DB_DIALECT,
  DB_PORT,
} = process.env;

const dialect = DB_DIALECT;
const host = DB_HOST;

module.exports = {
  development: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME_DEV,
    port: DB_PORT,
    host,
    dialect,
  },
  test: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME_TEST,
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
  },
};
