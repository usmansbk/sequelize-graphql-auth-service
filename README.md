# Apollo Express GraphQL Server Template

> This project assumes an Ubuntu 20 environment

## Features

- [ ] Email authentication
- [ ] SMS authentication
- [ ] Social authentication (Google and Facebook)
- [ ] RBAC
- [ ] Profile (Update and Delete)
- [ ] File Upload
- [ ] Push Notification
- [x] i18n

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

## [JSON Web Token](https://github.com/auth0/node-jsonwebtoken#readme)

This app makes use of JWT for authentication and other token generation. A `JWT_SECRET_KEY` is required for signing and verification of tokens.

In development and test environment, a local redis server is required

```sh
sudo apt install redis-server
```

While in production, a Redis server `REDIS_URL` environment variable is required.

### Create database

```sh
npx cross-env NODE_ENV=development sequelize db:create # development db

npx cross-env NODE_ENV=test npx sequelize db:create # test db
```

### Run migrations

```sh
npx sequelize db:migrate
```

## [Mailer](https://nodemailer.com/transports/ses/)

The server makes use of AWS SES to send emails in production. Set the following environment variables and ensure you have the right [AWS IAM Policy](https://nodemailer.com/transports/ses/#example-3) set for SES.

```sh
MAIL_FROM=sender@example.com

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
```

Check the [email-templates](https://github.com/forwardemail/email-templates) package for more details on creating emails.
