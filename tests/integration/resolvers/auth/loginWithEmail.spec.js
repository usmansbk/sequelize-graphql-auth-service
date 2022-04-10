import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import mailer from "~utils/mailer";
import UserFactory from "tests/factories/user";

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

  test("should login a user with correct email & password combination", async () => {
    const fields = UserFactory.attributes();
    await UserFactory.create(fields);

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
    const fields = UserFactory.attributes();
    await UserFactory.create(fields);

    const {
      data: { loginWithEmail },
    } = await server.executeOperation({
      query,
      variables: {
        input: {
          email: fields.email,
          password: fields.email,
        },
      },
    });
    expect(loginWithEmail.message).toMatch("IncorrectEmailOrPassword");
    expect(loginWithEmail.accessToken).toBeNull();
    expect(loginWithEmail.refreshToken).toBeNull();
  });

  test("should report on 5 failed attempts if account with verified email exist", async () => {
    const fields = UserFactory.attributes({ emailVerified: true });
    await UserFactory.create(fields);

    const attempts = new Array(5).fill(fields).map(
      ({ email }) =>
        new Promise((resolve) =>
          server
            .executeOperation({
              query,
              variables: {
                input: {
                  email,
                  password: email,
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
