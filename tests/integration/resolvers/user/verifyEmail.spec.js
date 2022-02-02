import { gql } from "apollo-server-express";
import db from "~db/models";
import store from "~utils/store";
import { EMAIL_VERIFICATION_KEY_PREFIX } from "~helpers/constants/auth";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";
import auth from "tests/support/auth";

const query = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      code
      message
      success
    }
  }
`;

describe("Mutation.verifyEmail", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
    await db.sequelize.close();
  });

  test("should verify registered user email", async () => {
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
    await user.reload();

    expect(user.emailVerified).toBe(true);
    expect(res.data.verifyEmail).toEqual({
      code: "EmailVerified",
      message: "EmailVerified",
      success: true,
    });
  });
});
