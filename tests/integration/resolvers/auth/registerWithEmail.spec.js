import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";

const REGISTER_WITH_EMAIL = gql`
  mutation RegisterWithEmail($input: CreateUserInput!) {
    registerWithEmail(input: $input) {
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

describe("Mutation.registerWithEmail", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(() => {
    server.stop();
    db.sequelize.close();
  });

  test("should register a new user and return the access and refresh tokens", async () => {
    const {
      data: { registerWithEmail },
    } = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: attributes.user(),
      },
    });
    expect(registerWithEmail.message).toMatch("WelcomeNewUser");
    expect(registerWithEmail.accessToken).toBeDefined();
    expect(registerWithEmail.refreshToken).toBeDefined();
  });

  test("should not register a user if the email is already taken and verified by an existing user", async () => {
    const existingUser = await db.User.create(
      attributes.user({ emailVerified: true })
    );
    const {
      data: { registerWithEmail },
    } = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: attributes.user({ email: existingUser.email }),
      },
    });
    expect(registerWithEmail.message).toMatch("SignUpFailed");
    expect(registerWithEmail.errors).toEqual([
      { field: "email", message: "UserEmailUnavailableError" },
    ]);
  });

  test("should register a new user if the email is taken but unverified", async () => {
    const existingUser = await db.User.create(attributes.user());
    const {
      data: { registerWithEmail },
    } = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: attributes.user({ email: existingUser.email }),
      },
    });
    expect(registerWithEmail.message).toMatch("WelcomeNewUser");
    expect(registerWithEmail.accessToken).toBeDefined();
    expect(registerWithEmail.refreshToken).toBeDefined();
  });
});
