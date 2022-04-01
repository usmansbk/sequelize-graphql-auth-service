import { gql } from "apollo-server-express";
import db from "~db/models";
import store from "~utils/store";
import mailer from "~utils/mailer";
import { EMAIL_VERIFICATION_KEY_PREFIX } from "~constants/auth";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";
import auth from "tests/support/auth";

const query = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      code
      message
      success
      user {
        id
        emailVerified
      }
    }
  }
`;

jest.mock("~utils/mailer", () => {
  return {
    sendEmail: jest.fn(),
  };
});

describe("Mutation.verifyEmail", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await store.clearAll();
    await server.stop();
    await db.sequelize.close();
  });

  test("should verify email and send welcome email", async () => {
    const user = await db.User.create(attributes.user());
    const authPayload = await auth.login(user);

    const key = `${EMAIL_VERIFICATION_KEY_PREFIX}:${user.id}`;
    await store.set({
      key,
      value: authPayload.accessToken,
      expiresIn: authPayload.exp,
    });

    const res = await server.executeOperation({
      query,
      variables: {
        token: authPayload.accessToken,
      },
    });

    expect(mailer.sendEmail).toBeCalledTimes(1);
    expect(res.data.verifyEmail).toEqual({
      code: "EmailVerified",
      message: "EmailVerified",
      success: true,
      user: {
        id: user.id,
        emailVerified: true,
      },
    });
  });

  test("should fail for invalid tokens", async () => {
    const { errors } = await server.executeOperation({
      query,
      variables: {
        token: "invalid",
      },
    });
    expect(errors[0].message).toMatch("TokenInvalidError");
  });
});
