# Auth Service

[![usmansbk](https://circleci.com/gh/usmansbk/sequelize-graphql-server.svg?style=svg)](https://app.circleci.com/pipelines/github/usmansbk/sequelize-graphql-server)

Authentication service/subgraph optimized for Sequelize ORM

## Features

- [x] User Management
- [x] RBAC
- [x] Email authentication
- [x] Social authentication (Google and Facebook)
- [x] SMS OTP
- [x] Multi Client
- [x] i18n
- [x] Dockerize
- [x] Analytics
- [x] CI/CD

## Built with

- [GraphQL](https://graphql.org/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [SequelizeORM](https://sequelize.org/master/manual/migrations.html)
- [ExpressJS](https://expressjs.com/)

## Prerequisite

- [Docker](https://docs.docker.com/)

## Run

- Create a **.env** file

copy `.env.example` file as `.env`

```sh
cp .env.example .env
```

or pull one from dotenv-vault, if your team has one

```sh
npx dotenv-vault@latest pull --dotenvMe=YOUR-TEAM-DOTENV_ME
```

- Build docker image

```sh
yarn docker:build
```

- Start container

```sh
yarn docker:start
```

## Open Shell

```sh
yarn docker:cli
```

## Generate JWT keys

- Create a folder to holder your keys

```sh
mkdir certs
```

- Generate a private key

```sh
openssl genrsa -out certs/private.pem 2048
```

- Generate a public key

```sh
openssl rsa -in certs/private.pem -pubout -outform PEM -out certs/public.pem
```

## Initialize database

- Create a root user

```sh
npx babel-node src/scripts/createRootUser
```

- Create client

  - You must pass the `client_id` in their request headers.

```sh
npx babel-node src/scripts/createApplication
```

- List existing clients

```sh
npx babel-node src/scripts/listApplications
```

- Seed database (optional)

```sh
yarn seed
```

## Test

- Create a `.env.test` file

```sh
cp .env.example .env.test
```

- Create Test database:

```sh
yarn createdb:test
```

- Run tests

```sh
yarn test
```

## Build

- Build production image

```sh
docker compose -t usmansbk/simple-server:release . -f Dockerfile.production
```

- Push to Docker Hub

```sh
docker push usmansbk/auth-service:release
```

## [Mailer](https://nodemailer.com/transports/ses/)

The server makes use of AWS SES to send emails. Setup your SES account and add the following environment variables. Verify your development email and ensure you have this [AWS IAM Policy](https://nodemailer.com/transports/ses/#example-3).

```sh
MAIL_FROM=sender@example.com

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
```

Check the [email-templates](https://github.com/forwardemail/email-templates) docs on how to design email templates.

## [SMS](https://www.twilio.com/docs/sms/quickstart/node)

Follow the official Twilio documentation to setup your Twilio account and add your `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` to your `.env` file.

## Google authentication

- Create a [Firebase](https://console.firebase.google.com) project if you don't have one.

- Go to **APIs & Auth** > **Credentials** in the [Google Developers Console](https://console.cloud.google.com/) and copy your **OAuth 2.0 Client IDs Web Client** `GOOGLE_CLIENT_ID` and `GOOGLE_SECRET_KEY`.

- Generate an _OAuth2 API v2_ id token from Google [0Auth 2.0 Playground](https://developers.google.com/oauthplayground/) to test.

## Facebook authentication

- Create a new [Facebook](https://developers.facebook.com/) app
- Get your [`FACEBOOK_APP_ACCESS_TOKEN`](https://developers.facebook.com/tools/access_token/) and `FACEBOOK_APP_ID` env variables
- Navigate to **Roles** ⟶ **Test Users** to get a test account access tokens

## File upload (S3)

We upload files via `REST` endpoints. [Why not File Upload mutation?](https://www.apollographql.com/blog/backend/file-uploads/file-upload-best-practices/)

To set up your `S3` for file storage:

- Add your `AWS_S3_BUCKET` to `env` file
- Ensure you've set the full s3 permissions

## Images CDN

Follow these [instructions](https://aws.amazon.com/solutions/implementations/serverless-image-handler/) to get your `CLOUDFRONT_API_ENDPOINT`. We use [Amazon CloudFront](https://aws.amazon.com/cloudfront/) to provide a caching layer to reduce the cost of image process and the latency of subsequent image delivery. The CloudFront domain name provides cached access to the image handler API.

## Filtering & Pagination

### Filtering

For a more complex filtering, we mimic the sequelize filter query. In order to filter by associations, we assume all associations are aliased (using the `as` option). This alias must have corresponding field in your graphql type. Example:

If you define a User `has-many` Task relationship like so,

```js
User.hasMany(Task, { as: "tasks" });
```

you must define a `tasks` field in your graphql `User` type schema

```gql
type User {
  tasks(filter: TaskFilter): TaskList!
}
```

Refer to the sequelize docs for more info on [Operators](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#operators)

### Pagination

Our cursor-based pagination must adhere to a `List` interface. This is similar to the relay-connection pagination. But unlike relay, we return our `items` as a flat list.

```gql
# Example
type TaskList implements List {
  items: [Task]!
  totalCount: Int!
  pageInfo: PageInfo!
}
```

### N+1 Problem

We eager-load requested fields that have a matching association `alias` in their corresponding model. Example: If we have a User `has-one` Picture relationship:

```js
User.hasOne(Picture, { as: "avatar" });
```

```gql
# This will eager-load the `avatar` association. Both user and avatar will be fetched in a single SQL query
query {
  user {
    id
    name
    avatar {
      url
    }
  }
}
```

#### Edge-cases:

- Eager-loading only works with `Query`. `Mutation` isn't supported

- Nested cursor-paginated fields aren't eager-loaded, and hard to maintain in the frontend.

- Paginated fields should be added to the root `Query` for the reason above.

## Analytics

[Segment](https://segment.com/docs/) allows us to collect data with different analytics tools. To setup our analytics, create a Segment account and add your `SEGMENT_WRITE_KEY` to the `.env` file.

## Error handling

We use ["wrapping exceptions"](https://javascript.info/custom-errors#wrapping-exceptions) technique to handle client generated errors. This allows us to take full control of the kind of errors we return, and easily translate them before sending to the end-users.

Internal server errors are logged to sentry. Create a [Sentry](https://sentry.io) account and add your `SENTRY_DSN` to the `.env` file.

## Coding standard

We use Eslint AirBnB coding guidelines and import alias. All aliases are prefixed with a `~`. To add a new alias, update the `jsconfig.json`, `.eslintrc.js`, and `babel.config.json` files. We also make use of Husky precommit hook to enforce standard.

Model specific logic should be moved to their associated data sources, and resolver errors should be handled using [Wrapping Exception](https://javascript.info/custom-errors) technique.

## Readings

- [GraphQL Schema Design: Building Evolvable Schemas](https://www.apollographql.com/blog/backend/schema-design/graphql-building-evolvable-schemas/)

- [Apollo Server File Upload Best Practices](https://www.apollographql.com/blog/backend/file-uploads/file-upload-best-practices/)

- [Designing a GraphQL server for optimal performance](https://blog.logrocket.com/designing-graphql-server-optimal-performance/)

- [GraphQL Cursors Connections Specification](https://relay.dev/graphql/connections.htm)

- [TDD, Where Did It All Go Wrong - Ian Cooper](https://www.youtube.com/watch?v=EZ05e7EMOLM&list=TLPQMjIwMTIwMjJnzh0h4NGjEg&index=2)
