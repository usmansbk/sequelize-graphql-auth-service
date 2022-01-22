import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";

const LOGIN_WITH_SOCIAL_PROVIDER = gql`
  mutation LoginWithSocialProvider($input: SocialLoginInput!) {
    loginWithSocialProvider(input: $input) {
      success
      code
      message
      accessToken
      refreshToken
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

  test("should register a new user if they don't exist", async () => {
    const {
      data: { loginWithSocialProvider },
    } = await server.executeOperation({
      query: LOGIN_WITH_SOCIAL_PROVIDER,
      variables: {
        input: { token: "faketoken", provider: "GOOGLE" },
      },
    });
    expect(loginWithSocialProvider.message).toMatch("WelcomeNewUser");
    expect(loginWithSocialProvider.accessToken).toBeDefined();
    expect(loginWithSocialProvider.refreshToken).toBeDefined();
  });

  test("should login an already existing user", async () => {
    const {
      data: { loginWithSocialProvider },
    } = await server.executeOperation({
      query: LOGIN_WITH_SOCIAL_PROVIDER,
      variables: {
        input: { token: "faketoken", provider: "GOOGLE" },
      },
    });
    expect(loginWithSocialProvider.message).toMatch("WelcomeBack");
    expect(loginWithSocialProvider.accessToken).toBeDefined();
    expect(loginWithSocialProvider.refreshToken).toBeDefined();
  });

  test("should throw an error for invalid token", async () => {
    const { errors } = await server.executeOperation({
      query: LOGIN_WITH_SOCIAL_PROVIDER,
      variables: {
        input: { token: "invalid", provider: "GOOGLE" },
      },
    });
    expect(errors[0].message).toMatch("TokenInvalidError");
  });
});
