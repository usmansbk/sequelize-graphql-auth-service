# Apollo Express GraphQL Server Template

## Features

- [ ] Email authentication
- [ ] SMS authentication
- [ ] Social authentication (Google and Facebook)
- [ ] RBAC
- [ ] Profile (Update and Delete)
- [ ] File Upload
- [ ] Push Notification
- [ ] i18n

## Prerequisites

- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [SequelizeORM](https://sequelize.org/master/manual/migrations.html)
- [ExpressJS](https://expressjs.com/)

## Environment

Export the followng enviroment variables or create a `.env` file

```sh
NODE_ENV=development
APP_NAME=apollo-server-express

DB_USERNAME=apollo-server-express
DB_PASSWORD=apollo-server-express
DB_NAME_DEV=apollo-server-express_development
DB_NAME_TEST=apollo-server-express_test
DB_HOST=127.0.0.1
DB_DIALECT=postgres
```

## Setting Up a Database

This template uses PostgreSQL as the default database.

```sh
# Install PostgreSQL
sudo apt install postgresql-11 libpq-dev
```

The postgres installation doesn't setup a user for you, so you'll need to follow these steps to create a user with permission to create databases. Feel free to replace `apollo-server-express` with your username and remember to update your `.env` file `DB_USERNAME` key.

```sh

sudo -u postgres createuser apollo-server-express -s

# Set a password for the user by doing the following

sudo -u postgres psql
postgres=# \password apollo-server-express

# Create the database
npx sequelize db:create
```

## JWT

This app makes use of JWT for authentication and other token generation. To sign your tokens,
export the `JWT_SECRET_KEY` to your environment variables.
