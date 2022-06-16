import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import cache from "~utils/cache";
import jwt from "~utils/jwt";
import { PASSWORD_KEY_PREFIX } from "~helpers/constants/auth";

const query = gql`
  mutation ResetPassword($input: PasswordResetInput!) {
    resetPassword(input: $input) {
      code
      message
      success
    }
  }
`;

describe("Mutation.resetPassword", () => {
  let server;
  let user;
  let token;
  beforeAll(async () => {
    await FactoryBot.truncate();
    server = createApolloTestServer();
    user = await FactoryBot.create("user");
    const result = jwt.generateToken({
      sub: user.id,
    });
    token = result.token;
    await cache.set(
      `${PASSWORD_KEY_PREFIX}:${user.id}`,
      result.token,
      "1 minute"
    );
  });

  test("should update password and logout", async () => {
    const password = "password1";
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            token,
            password,
          },
        },
      },
      { currentUser: user }
    );

    await user.reload();
    const changed = await user.checkPassword(password);
    const sid = await cache.get(`${process.env.WEB_CLIENT_ID}:${user.id}`);

    expect(res.data.resetPassword).toEqual({
      code: "PasswordChanged",
      message: "PasswordChanged",
      success: true,
    });
    expect(changed).toBe(true);
    expect(sid).toBe(null);
  });

  test("should not allow used token", async () => {
    const newPassword = "password";
    const res = await server.executeOperation({
      query,
      variables: {
        input: {
          token,
          password: newPassword,
        },
      },
    });
    expect(res.data.resetPassword).toEqual({
      code: "InvalidLink",
      message: "InvalidLink",
      success: false,
    });
  });
});
