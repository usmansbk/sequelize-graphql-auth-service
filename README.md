# Apollo Express GraphQL Server Template

> This project assumes an Ubuntu 20 environment

## Features

- [x] Email authentication
- [x] SMS OTP
- [x] Social authentication (Google and Facebook)
- [x] RBAC
- [x] Profile (Update and Delete)
- [x] File Upload
- [x] i18n
- [ ] Push Notification
- [ ] Analytics

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
sudo apt install postgresql-12 libpq-dev
```

The postgres installation doesn't setup a user for you, so you'll need to follow these steps to create a user with permission to create databases. Feel free to replace `apollo-server-express` with your username and remember to update your `.env` file `DB_USERNAME` key.

```sh

sudo -u postgres createuser apollo-server-express -s

# Set a password for the user by doing the following

sudo -u postgres psql
postgres=# \password apollo-server-express

# Create the database
npx cross-env NODE_ENV=development sequelize db:create # development db

npx cross-env NODE_ENV=test npx sequelize db:create # test db

# Run migrations
npx sequelize db:migrate
```

## [JSON Web Token](https://github.com/auth0/node-jsonwebtoken#readme)

We make use of JWT for authentication and authorization. [Read about the 3 main types of tokens](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/).

### Generate token verification and signing keys

```sh
## Private key
ssh-keygen -t rsa -P "" -b 4096 -m PEM -f jwtRS256.key

## Public key
ssh-keygen -e -m PEM -f jwtRS256.key > jwtRS256.key.pub
```

Set up a local [redis server](https://redis.io/download#from-the-official-ubuntu-ppa) to manage tokens in development

```sh
sudo apt install redis-server
```

While in production, a Redis server `REDIS_URL` environment variable is required.

## Clients (Mobile, Web, etc)

Each supported client must pass a `client_id` in their request headers. Client IDs are strings assigned by the server. To support a new client, add the ID to the list of supported clients. This will allow users to login from multiple clients.

```sh
## src/utils/jwt
const audience = [process.env.CLIENT_ID, 'your-new-client-id'];
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

## [SMS](https://www.twilio.com/docs/sms/quickstart/node)

Follow the official Twilio documentation to setup your Twilio account and add your `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `PHONE_NUMBER` to your `.env` file.

## Google authentication

- Create a [Firebase](https://console.firebase.google.com) project if you don't have one.

- Go to **APIs & Auth** > **Credentials** in the [Google Developers Console](https://console.cloud.google.com/) and download your **OAuth 2.0 Client IDs Web Client** JSON credentials. (This file is your only copy of these credentials. It should never be committed with your source code, and should be stored securely)

- Once downloaded, store the path to this file in the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

- Generate test tokens from Google [0Auth 2.0 Playground](https://developers.google.com/oauthplayground/)

## Facebook authentication

- Create a new [Facebook](https://developers.facebook.com/) app
- Get your [`FACEBOOK_APP_ACCESS_TOKEN`](https://developers.facebook.com/tools/access_token/) and `FACEBOOK_APP_ID` env variables
- Navigate to **Roles** ⟶ **Test Users** to get a test account access tokens

## File upload (S3)

We upload files via `REST` endpoints. [Why not File Upload mutation?](https://www.apollographql.com/blog/backend/file-uploads/file-upload-best-practices/)

To set up your `S3` for file storage:

- Add your `S3_BUCKET` to `env` file
- Ensure you've set the full s3 permissions

## Images CDN

Follow these [instructions](https://aws.amazon.com/solutions/implementations/serverless-image-handler/) to get your `CLOUDFRONT_API_ENDPOINT`. We use [Amazon CloudFront](https://aws.amazon.com/cloudfront/) to provide a caching layer to reduce the cost of image process and the latency of subsequent image delivery. The CloudFront domain name provides cached access to the image handler API.

## Coding standard

We use Eslint AirBnB coding guidelines and import alias. All aliases are prefixed with a `~`. To add a new alias, update the `jsconfig.json`, `.eslintrc.js`, and `babel.config.json` files. We also make use of Husky precommit hook to enforce standard.

Model specific logic should be moved to their associated data sources, and resolver errors should be handled using [Wrapping Exception](https://javascript.info/custom-errors) technique.

## Readings

- [GraphQL Schema Design: Building Evolvable Schemas](https://www.apollographql.com/blog/backend/schema-design/graphql-building-evolvable-schemas/)

- [Apollo Server File Upload Best Practices](https://www.apollographql.com/blog/backend/file-uploads/file-upload-best-practices/)

- [Designing a GraphQL server for optimal performance](https://blog.logrocket.com/designing-graphql-server-optimal-performance/)

- [GraphQL Cursors Connections Specification](https://relay.dev/graphql/connections.htm)

- [TDD, Where Did It All Go Wrong - Ian Cooper](https://www.youtube.com/watch?v=EZ05e7EMOLM&list=TLPQMjIwMTIwMjJnzh0h4NGjEg&index=2)
