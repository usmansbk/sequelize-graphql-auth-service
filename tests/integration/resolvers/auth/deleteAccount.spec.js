import { gql } from "apollo-server-express";
import db from "~db/models";
import store from "~utils/store";
import files from "~utils/files";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";
import auth from "tests/support/auth";
import { DELETE_ACCOUNT_KEY_PREFIX } from "~helpers/constants/auth";

files.remove = jest.fn();

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
    await db.sequelize.close();
  });

  let token;
  let user;
  beforeEach(async () => {
    user = await db.User.create(attributes.user());
    const authPayload = await auth.login(user);
    const key = `${DELETE_ACCOUNT_KEY_PREFIX}:${user.id}`;
    token = authPayload.accessToken;
    await store.set({
      key,
      value: authPayload.accessToken,
      expiresIn: authPayload.exp,
    });
  });

  test("should delete user", async () => {
    const res = await server.executeOperation({
      query,
      variables: {
        token,
      },
    });
    const found = await db.User.findByPk(user.id);

    expect(found).toBe(null);
    expect(res.data?.deleteAccount).toEqual({
      code: "AccountDeleted",
      message: "AccountDeleted",
      success: true,
    });
  });

  test("should remove avatar from s3", async () => {
    await user.update({ avatar: attributes.file() });
    const res = await server.executeOperation({
      query,
      variables: {
        token,
      },
    });

    expect(files.remove).toBeCalledTimes(1);
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

    expect(res.errors[0].message).toBe("TokenInvalidError");
  });
});
