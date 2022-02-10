import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";
import mailer from "~utils/mailer";

mailer.sendEmail = jest.fn();

const query = gql`
  mutation AdminLogin($input: AdminLoginInput!) {
    adminLogin(input: $input) {
      success
      code
      message
      accessToken
      refreshToken
    }
  }
`;

describe("Mutation.adminLogin", () => {
  let server;
  let role;
  beforeAll(async () => {
    server = createApolloTestServer();
    role = await db.Role.create({ name: "ADMIN" });
  });

  afterAll(async () => {
    await server.stop();
    await db.sequelize.close();
  });

  test("should login a user with correct username & password combination", async () => {
    const fields = attributes.user();
    const user = await db.User.create(fields);
    await user.addRole(role);

    const {
      data: { adminLogin },
    } = await server.executeOperation({
      query,
      variables: {
        input: {
          username: fields.username,
          password: fields.password,
        },
      },
    });
    expect(adminLogin.message).toMatch("WelcomeBack");
    expect(adminLogin.accessToken).toBeDefined();
    expect(adminLogin.refreshToken).toBeDefined();
  });

  test("should login a non-admin user with correct username & password combination", async () => {
    const fields = attributes.user();
    await db.User.create(fields);

    const {
      data: { adminLogin },
    } = await server.executeOperation({
      query,
      variables: {
        input: {
          username: fields.username,
          password: fields.password,
        },
      },
    });
    expect(adminLogin.message).toMatch("IncorrectUsernameOrPassword");
    expect(adminLogin.accessToken).toBeDefined();
    expect(adminLogin.refreshToken).toBeDefined();
  });

  test("should not login a user with wrong username & password combination", async () => {
    const fields = attributes.user();
    const user = await db.User.create(fields);
    await user.addRole(role);

    const {
      data: { adminLogin },
    } = await server.executeOperation({
      query,
      variables: {
        input: {
          username: fields.username,
          password: fields.email,
        },
      },
    });
    expect(adminLogin.message).toMatch("IncorrectUsernameOrPassword");
    expect(adminLogin.accessToken).toBeNull();
    expect(adminLogin.refreshToken).toBeNull();
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
            .then((res) => resolve(res.data.adminLogin.message))
        )
    );

    await Promise.all(attempts);

    expect(mailer.sendEmail).toBeCalledTimes(1);
  });
});
