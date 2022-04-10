import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/mocks/apolloServer";
import attributes from "tests/attributes";
import mailer from "~utils/mailer";

mailer.sendEmail = jest.fn();

const query = gql`
  mutation AdminLogin($input: AdminLoginInput!) {
    loginToAdmin(input: $input) {
      success
      code
      message
      accessToken
      refreshToken
    }
  }
`;

describe("Mutation.loginToAdmin", () => {
  let server;
  let role;
  beforeAll(async () => {
    server = createApolloTestServer();
    role = await db.Role.create({ name: "admin" });
  });

  afterAll(async () => {
    await server.stop();
  });

  test("should login a user with correct username & password combination", async () => {
    const fields = attributes.user({ emailVerified: true });
    const user = await db.User.create(fields);
    await user.addRole(role);

    const {
      data: { loginToAdmin },
    } = await server.executeOperation({
      query,
      variables: {
        input: {
          username: fields.username,
          password: fields.password,
        },
      },
    });
    expect(loginToAdmin.message).toMatch("WelcomeBack");
    expect(loginToAdmin.accessToken).toBeDefined();
    expect(loginToAdmin.refreshToken).toBeDefined();
  });

  test("should not login a non-admin user with correct username & password combination", async () => {
    const fields = attributes.user();
    await db.User.create(fields);

    const res = await server.executeOperation({
      query,
      variables: {
        input: {
          username: fields.username,
          password: fields.password,
        },
      },
    });
    const {
      data: { loginToAdmin },
    } = res;
    expect(loginToAdmin.message).toMatch("IncorrectUsernameOrPassword");
    expect(loginToAdmin.accessToken).toBeDefined();
    expect(loginToAdmin.refreshToken).toBeDefined();
  });

  test("should not login admin with wrong username & password combination", async () => {
    const fields = attributes.user({ emailVerified: true });
    const user = await db.User.create(fields);
    await user.addRole(role);

    const {
      data: { loginToAdmin },
    } = await server.executeOperation({
      query,
      variables: {
        input: {
          username: fields.username,
          password: fields.email,
        },
      },
    });
    expect(loginToAdmin.message).toMatch("IncorrectUsernameOrPassword");
    expect(loginToAdmin.accessToken).toBeNull();
    expect(loginToAdmin.refreshToken).toBeNull();
  });

  test("should report on 5 failed attempts if account with verified email exist", async () => {
    const fields = attributes.user({ emailVerified: true });
    const user = await db.User.create(fields);
    await user.addRole(role);

    const attempts = new Array(5).fill(fields).map(
      ({ username }) =>
        new Promise((resolve) =>
          server
            .executeOperation({
              query,
              variables: {
                input: {
                  username,
                  password: username,
                },
              },
            })
            .then((res) => resolve(res.data.loginToAdmin.message))
        )
    );

    await Promise.all(attempts);

    expect(mailer.sendEmail).toBeCalledTimes(1);
  });
});
