import { gql } from "apollo-server-express";
import db from "~db/models";
import store from "~utils/store";
import { PHONE_NUMBER_KEY_PREFIX } from "~constants/auth";
import createApolloTestServer from "tests/mocks/apolloServer";
import attributes from "tests/attributes";

const query = gql`
  mutation VerifyPhoneNumber($token: String!) {
    verifyPhoneNumber(token: $token) {
      code
      message
      success
      user {
        id
        phoneNumberVerified
      }
    }
  }
`;

describe("Mutation.verifyPhoneNumber", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await store.clearAll();
    await server.stop();
    await db.sequelize.close();
  });

  test("should verify phone number", async () => {
    const currentUser = await db.User.create(attributes.user());

    const token = "mockToken";
    const key = `${PHONE_NUMBER_KEY_PREFIX}:${currentUser.id}`;
    await store.set({
      key,
      value: token,
      expiresIn: 10000,
    });

    const res = await server.executeOperation(
      {
        query,
        variables: {
          token,
        },
      },
      { currentUser }
    );

    expect(res.data.verifyPhoneNumber).toEqual({
      code: "PhoneNumberVerified",
      message: "PhoneNumberVerified",
      success: true,
      user: {
        id: currentUser.id,
        phoneNumberVerified: true,
      },
    });
  });

  test("should not use invalid otp", async () => {
    const user = await db.User.create(attributes.user());

    const res = await server.executeOperation(
      {
        query,
        variables: {
          token: "mockToken",
        },
      },
      { currentUser: user }
    );

    expect(res.data.verifyPhoneNumber).toEqual({
      code: "InvalidOtp",
      message: "InvalidOtp",
      success: false,
      user: null,
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
