import { gql } from "apollo-server-express";
import attributes from "tests/attributes";
import createApolloTestServer from "tests/mocks/apolloServer";
import db from "~db/models";
import jwt from "~utils/jwt";
import TokenError from "~utils/errors/TokenError";
import store from "~utils/store";
import { TOKEN_INVALID_ERROR } from "~constants/i18n";

jwt.verifySocialToken = jest.fn();

const query = gql`
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

describe("Mutation.loginWithSocialProvider", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await store.clearAll();
    await server.stop();
    await db.sequelize.close();
  });

  test("should register a new user if they don't exist", async () => {
    const { firstName, lastName, email } = attributes.user();
    jwt.verifySocialToken.mockReturnValue({
      firstName,
      lastName,
      email,
    });
    const {
      data: { loginWithSocialProvider },
    } = await server.executeOperation({
      query,
      variables: {
        input: { token: "faketoken", provider: "GOOGLE" },
      },
    });
    expect(loginWithSocialProvider.message).toMatch("WelcomeNewUser");
    expect(loginWithSocialProvider.accessToken).toBeDefined();
    expect(loginWithSocialProvider.refreshToken).toBeDefined();
  });

  test("should login an already existing user", async () => {
    const fields = attributes.user();
    await db.User.create(fields);
    jwt.verifySocialToken.mockReturnValue({
      firstName: fields.firstName,
      lastName: fields.lastName,
      email: fields.email,
    });
    const {
      data: { loginWithSocialProvider },
    } = await server.executeOperation({
      query,
      variables: {
        input: { token: "faketoken", provider: "GOOGLE" },
      },
    });
    expect(loginWithSocialProvider.message).toMatch("WelcomeBack");
    expect(loginWithSocialProvider.accessToken).toBeDefined();
    expect(loginWithSocialProvider.refreshToken).toBeDefined();
  });

  test("should throw an error for invalid token", async () => {
    jwt.verifySocialToken.mockImplementation(() => {
      throw new TokenError(TOKEN_INVALID_ERROR);
    });
    const { errors } = await server.executeOperation({
      query,
      variables: {
        input: { token: "invalid", provider: "GOOGLE" },
      },
    });
    expect(errors[0].message).toMatch("TokenInvalidError");
  });
});
