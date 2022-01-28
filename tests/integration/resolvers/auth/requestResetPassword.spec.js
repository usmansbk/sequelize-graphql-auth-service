import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";
import mailer from "~utils/mailer";

jest.mock("~utils/mailer", () => {
  return {
    sendEmail: jest.fn(),
  };
});

const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      success
      message
      code
    }
  }
`;

describe("Mutation.requestResetPassword", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
    await db.sequelize.close();
  });

  test("should send a reset password link to registered user", async () => {
    const loggedInUser = await db.User.create(attributes.user());
    const {
      data: { requestPasswordReset },
    } = await server.executeOperation({
      query: REQUEST_PASSWORD_RESET,
      variables: {
        email: loggedInUser.email,
      },
    });
    expect(requestPasswordReset.message).toMatch("SentResetPasswordEmail");
    expect(mailer.sendEmail.mock.calls.length).toBe(1);
  });

  test("should not send a reset password link to unregistered user", async () => {
    const {
      data: { requestPasswordReset },
    } = await server.executeOperation({
      query: REQUEST_PASSWORD_RESET,
      variables: {
        email: attributes.user().email,
      },
    });
    expect(requestPasswordReset.message).toMatch("SentResetPasswordEmail");
    expect(mailer.sendEmail.mock.calls.length).toBe(0);
  });

  test("should not send email until previous one is used or expired", async () => {
    const fields = attributes.user();
    await db.User.create(fields);
    const NUMBER_OF_REQUESTS = 4;

    const requests = new Array(NUMBER_OF_REQUESTS).fill(fields).map(
      ({ email }) =>
        new Promise((resolve) => {
          server
            .executeOperation({
              query: REQUEST_PASSWORD_RESET,
              variables: {
                email,
              },
            })
            .then(({ data: { requestPasswordReset } }) => {
              resolve(requestPasswordReset.message);
            });
        })
    );
    await Promise.all(requests);
    expect(requests.length).toBe(NUMBER_OF_REQUESTS);
    expect(mailer.sendEmail.mock.calls.length).toBe(1);
  });
});
