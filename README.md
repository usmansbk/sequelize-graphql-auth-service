# Apollo Express GraphQL Server Template

## Features

- [ ] Email authentication
- [ ] SMS authentication
- [ ] Social authentication (Google and Facebook)
- [ ] Profile (Update and Delete)
- [ ] File Upload
- [ ] Push Notification
- [ ] RBAC

## Prerequisites

- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [SequelizeORM](https://sequelize.org/master/manual/migrations.html)
- [ExpressJS](https://expressjs.com/)

## Environment

Export the followng enviroment variables or create a `.env` file

```sh
NODE_ENV=
APP_NAME=

DB_USERNAME=
DB_PASSWORD=
DB_NAME=
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
