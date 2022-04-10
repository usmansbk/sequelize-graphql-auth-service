import { gql } from "apollo-server-express";
import store from "~utils/store";
import createApolloTestServer from "tests/mocks/apolloServer";
import jwt from "~utils/jwt";
import { DELETE_ACCOUNT_KEY_PREFIX } from "~constants/auth";
import UserFactory from "tests/factories/user";

const query = gql`
  mutation DeleteAccount($token: String!) {
    deleteAccount(token: $token) {
      code
      message
      success
    }
  }
`;

describe("Mutation.deleteAccount", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  let token;
  let user;
  beforeEach(async () => {
    user = await UserFactory.create();
    const key = `${DELETE_ACCOUNT_KEY_PREFIX}:${user.id}`;
    const payload = jwt.generateToken({
      sub: user.id,
      aud: process.env.WEB_CLIENT_ID,
    });
    token = payload.token;
    await store.set({
      key,
      value: token,
      expiresIn: payload.exp,
    });
  });

  test("should delete user", async () => {
    const res = await server.executeOperation({
      query,
      variables: {
        token,
      },
    });
    const found = await UserFactory.model.findByPk(user.id);

    expect(found).toBe(null);
    expect(res.data?.deleteAccount).toEqual({
      code: "AccountDeleted",
      message: "AccountDeleted",
      success: true,
    });
  });

  test("should fail for invalid token", async () => {
    const res = await server.executeOperation({
      query,
      variables: {
        token: "invalid",
      },
    });

    expect(res.errors[0].message).toMatch("TokenInvalidError");
  });
});
