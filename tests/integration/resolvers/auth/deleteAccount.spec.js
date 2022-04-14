import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import cache from "~utils/cache";
import jwt from "~utils/jwt";
import { DELETE_ACCOUNT_KEY_PREFIX } from "~constants/auth";

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

  afterAll((done) => {
    server.stop().then(done);
  });

  beforeEach(async () => {
    await FactoryBot.truncate();
  });

  let token;
  let user;
  beforeEach(async () => {
    user = await FactoryBot.create("user");
    const key = `${DELETE_ACCOUNT_KEY_PREFIX}:${user.id}`;
    const payload = jwt.generateToken({
      sub: user.id,
      aud: process.env.WEB_CLIENT_ID,
    });
    token = payload.token;
    await cache.set(key, token, payload.exp);
  });

  test("should delete user", async () => {
    const res = await server.executeOperation({
      query,
      variables: {
        token,
      },
    });
    const deleted = await FactoryBot.db("user").findByPk(user.id);

    expect(deleted).toBe(null);
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
