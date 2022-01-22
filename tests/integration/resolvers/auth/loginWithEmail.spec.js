import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";

const LOGIN_WITH_EMAIL = gql`
  mutation RegisterWithEmail($input: EmailLoginInput!) {
    loginWithEmail(input: $input) {
      success
      code
      message
      accessToken
      refreshToken
      errors {
        field
        message
      }
    }
  }
`;

describe("Mutation.loginWithEmail", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(() => {
    server.stop();
    db.sequelize.close();
  });

  test("should login a user with correct email & password combination", async () => {
    const fields = attributes.user();
    await db.User.create(fields);

    const {
      data: { loginWithEmail },
    } = await server.executeOperation({
      query: LOGIN_WITH_EMAIL,
      variables: {
        input: {
          email: fields.email,
          password: fields.password,
        },
      },
    });
    expect(loginWithEmail.message).toMatch("WelcomeBack");
    expect(loginWithEmail.accessToken).toBeDefined();
    expect(loginWithEmail.refreshToken).toBeDefined();
  });

  test("should not login a user with wrong email & password combination", async () => {
    const fields = attributes.user();
    await db.User.create(fields);

    const {
      data: { loginWithEmail },
    } = await server.executeOperation({
      query: LOGIN_WITH_EMAIL,
      variables: {
        input: {
          email: fields.email,
          password: fields.email,
        },
      },
    });
    expect(loginWithEmail.message).toMatch("IncorrectEmailAndPassword");
    expect(loginWithEmail.accessToken).toBeNull();
    expect(loginWithEmail.refreshToken).toBeNull();
  });
});
