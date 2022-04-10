import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import mailer from "~utils/mailer";

mailer.sendEmail = jest.fn();

const query = gql`
  mutation LoginWithEmail($input: EmailLoginInput!) {
    loginWithEmail(input: $input) {
      success
      code
      message
      accessToken
      refreshToken
    }
  }
`;

describe("Mutation.loginWithEmail", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(async () => {
    await FactoryBot.truncate();
  });

  test("should login a user with correct email & password combination", async () => {
    const fields = FactoryBot.attributesFor("user");
    await FactoryBot.create("user", fields);

    const {
      data: { loginWithEmail },
    } = await server.executeOperation({
      query,
      variables: {
        input: {
          email: fields.email,
          password: fields.password,
        },
      },
    });
    expect(loginWithEmail.message).toMatch("WelcomeBack");
    expect(loginWithEmail.accessToken).toBeDefined();
    expect(loginWithEmail.refreshToken).toBeDefined();
  });

  test("should not login a user with wrong email & password combination", async () => {
    const user = await FactoryBot.create("user");

    const {
      data: { loginWithEmail },
    } = await server.executeOperation({
      query,
      variables: {
        input: {
          email: user.email,
          password: "wrong-password",
        },
      },
    });
    expect(loginWithEmail.message).toMatch("IncorrectEmailOrPassword");
    expect(loginWithEmail.accessToken).toBeNull();
    expect(loginWithEmail.refreshToken).toBeNull();
  });

  test("should report on 5 failed attempts if account with verified email exist", async () => {
    const user = await FactoryBot.create("user", {
      emailVerified: true,
    });

    const attempts = new Array(5).fill(user.toJSON()).map(
      ({ email }) =>
        new Promise((resolve) =>
          server
            .executeOperation({
              query,
              variables: {
                input: {
                  email,
                  password: "wrong-password",
                },
              },
            })
            .then((res) => resolve(res.data.loginWithEmail.message))
        )
    );

    await Promise.all(attempts);

    expect(mailer.sendEmail).toBeCalledTimes(1);
  });
});
