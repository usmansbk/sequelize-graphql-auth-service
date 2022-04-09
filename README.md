# Sequelize GraphQL Server Template

GraphQL server optimized for Sequelize ORM

## Features

- [x] Email authentication
- [x] SMS OTP
- [x] Social authentication (Google and Facebook)
- [x] RBAC
- [x] Profile (Update and Delete)
- [x] File Upload
- [x] i18n
- [x] Dockerize
- [ ] Push Notification
- [ ] Analytics

## Built with

- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [SequelizeORM](https://sequelize.org/master/manual/migrations.html)
- [ExpressJS](https://expressjs.com/)

## Prerequisite

- [Docker](https://docs.docker.com/)

## Run with Docker

### Generate token verification and signing keys

```sh
# Private key
ssh-keygen -t rsa -P "" -b 4096 -m PEM -f jwtRS256.key

# Public key
ssh-keygen -e -m PEM -f jwtRS256.key > jwtRS256.key.pub
```

### Add **.env** file

```sh
# Rename `.env.example` file to .env
mv .env.example .env
```

### Build image

```sh
docker-compose build
```

### Create database

```sh
# development database
docker-compose run api npx cross-env NODE_ENV=development npx sequelize db:create
```

```sh
# test database
docker-compose run api npx cross-env NODE_ENV=test npx sequelize db:create
```

```sh
# Migrations (optional)
docker-compose run api npx cross-env NODE_ENV=development npx sequelize db:migrate
```

### Start container

```sh
docker-compose up
```

### Test

```sh
docker-compose run api yarn test
```

## Clients (Mobile, Web, etc)

Each supported client must pass a `client_id` in their request headers. Client IDs are strings assigned by the server. To support a new client, add the ID to the list of audience. This will allow users to login from multiple clients.

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

Check the [email-templates](https://github.com/forwardemail/email-templates) docs on how to build email templates.

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

- Nested cursor-paginated fields aren't eager-loaded

Example: Assuming we have a User type defined,

```gql
type User {
  id
  avatar: Photo
  tasks: TaskList!
  savedTasks: [Task]
}
```

The following query will run two seperate SQL queries
One to fetch `user`, `avatar`, and `savedTasks`, and the other to fetch `tasks`

```gql
query {
  user {
    id
    ## this will be eager-loaded
    avatar {
      url
    }

    ## ...while this will run an extra query
    tasks {
      items {
        id
        name
      }
      pageInfo {
        ...
      }
    }

    ## this is not paginated. So it'll be eager-loaded
    savedTasks {
      id
      name
    }
  }
}
```

## Error handling

We use ["wrapping exceptions"](https://javascript.info/custom-errors#wrapping-exceptions) technique to handle errors. This allows us to take full control of the kind of errors we return, and easily translate them before sending to the end-users.

## Coding standard

We use Eslint AirBnB coding guidelines and import alias. All aliases are prefixed with a `~`. To add a new alias, update the `jsconfig.json`, `.eslintrc.js`, and `babel.config.json` files. We also make use of Husky precommit hook to enforce standard.

Model specific logic should be moved to their associated data sources, and resolver errors should be handled using [Wrapping Exception](https://javascript.info/custom-errors) technique.

## Readings

- [GraphQL Schema Design: Building Evolvable Schemas](https://www.apollographql.com/blog/backend/schema-design/graphql-building-evolvable-schemas/)

- [Apollo Server File Upload Best Practices](https://www.apollographql.com/blog/backend/file-uploads/file-upload-best-practices/)

- [Designing a GraphQL server for optimal performance](https://blog.logrocket.com/designing-graphql-server-optimal-performance/)

- [GraphQL Cursors Connections Specification](https://relay.dev/graphql/connections.htm)

- [TDD, Where Did It All Go Wrong - Ian Cooper](https://www.youtube.com/watch?v=EZ05e7EMOLM&list=TLPQMjIwMTIwMjJnzh0h4NGjEg&index=2)
