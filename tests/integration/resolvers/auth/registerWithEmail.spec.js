import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
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

  afterAll(async () => {
    await server.stop();
  });

  test("should register a new user and return the access and refresh tokens", async () => {
    const {
      data: { registerWithEmail },
    } = await server.executeOperation({
      query,
      variables: {
        input: FactoryBot.attributesFor("user"),
      },
    });
    expect(registerWithEmail.message).toMatch("WelcomeNewUser");
    expect(registerWithEmail.accessToken).toBeDefined();
    expect(registerWithEmail.refreshToken).toBeDefined();
  });

  test("should not register a user if the email is already taken and verified by an existing user", async () => {
    const existingUser = await FactoryBot.create("user", {
      emailVerified: true,
    });

    const res = await server.executeOperation({
      query,
      variables: {
        input: FactoryBot.attributesFor("user", { email: existingUser.email }),
      },
    });
    const {
      data: { registerWithEmail },
    } = res;
    expect(registerWithEmail.message).toMatch("SignUpFailed");
    expect(registerWithEmail.errors).toEqual([
      { field: "email", message: "UserEmailUnavailableError" },
    ]);
  });

  test("should register a new user if the email is taken but unverified", async () => {
    const existingUser = await FactoryBot.create("user");
    const res = await server.executeOperation({
      query,
      variables: {
        input: FactoryBot.attributesFor("user", { email: existingUser.email }),
      },
    });
    const {
      data: { registerWithEmail },
    } = res;
    expect(registerWithEmail.message).toMatch("WelcomeNewUser");
    expect(registerWithEmail.accessToken).toBeDefined();
    expect(registerWithEmail.refreshToken).toBeDefined();
  });
});
