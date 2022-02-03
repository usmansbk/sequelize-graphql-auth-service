import { gql } from "apollo-server-express";
import db from "~db/models";
import store from "~utils/store";
import { PHONE_NUMBER_KEY_PREFIX } from "~helpers/constants/auth";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";
import auth from "tests/support/auth";

const query = gql`
  mutation VerifyPhoneNumber($token: String!) {
    verifyPhoneNumber(token: $token) {
      code
      message
      success
    }
  }
`;

describe("Mutation.verifyPhoneNumber", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
    await db.sequelize.close();
  });

  test("should verify phone number", async () => {
    const user = await db.User.create(attributes.user());
    const authPayload = await auth.login(user);

    const key = `${PHONE_NUMBER_KEY_PREFIX}:${user.id}`;
    await store.set({
      key,
      value: authPayload.accessToken,
      expiresIn: authPayload.exp,
    });

    const res = await server.executeOperation(
      {
        query,
        variables: {
          token: authPayload.accessToken,
        },
      },
      { tokenInfo: { sub: user.id } }
    );
    await user.reload();

    expect(user.phoneNumberVerified).toBe(true);
    expect(res.data.verifyPhoneNumber).toEqual({
      code: "PhoneNumberVerified",
      message: "PhoneNumberVerified",
      success: true,
    });
  });

  test("should not use invalid otp", async () => {
    const user = await db.User.create(attributes.user());
    const authPayload = await auth.login(user);

    const res = await server.executeOperation(
      {
        query,
        variables: {
          token: authPayload.accessToken,
        },
      },
      { tokenInfo: { sub: user.id } }
    );
    await user.reload();

    expect(res.data.verifyPhoneNumber).toEqual({
      code: "InvalidOtp",
      message: "InvalidOtp",
      success: false,
    });
  });

  test("should not allow unauthenticated access", async () => {
    const { errors } = await server.executeOperation({
      query,
      variables: {
        token: "invalid",
      },
    });
    expect(errors[0].message).toMatch("Unauthenticated");
  });
});
