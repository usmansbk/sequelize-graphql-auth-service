import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import mailer from "~utils/mailer";

jest.mock("~utils/mailer", () => {
  return {
    sendEmail: jest.fn(),
  };
});

const query = gql`
  mutation RequestPasswordReset($email: EmailAddress!) {
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

  afterAll((done) => {
    server.stop().then(done);
  });

  beforeEach(async () => {
    await FactoryBot.truncate();
  });

  test("should send a reset password link to registered user", async () => {
    const currentUser = await FactoryBot.create("user");
    const {
      data: { requestPasswordReset },
    } = await server.executeOperation({
      query,
      variables: {
        email: currentUser.email,
      },
    });
    expect(requestPasswordReset.message).toMatch("SentResetPasswordEmail");
    expect(mailer.sendEmail).toBeCalledTimes(1);
  });

  test("should not send a reset password link to unregistered user", async () => {
    const {
      data: { requestPasswordReset },
    } = await server.executeOperation({
      query,
      variables: {
        email: FactoryBot.attributesFor("user").email,
      },
    });
    expect(requestPasswordReset.message).toMatch("SentResetPasswordEmail");
    expect(mailer.sendEmail).toBeCalledTimes(0);
  });

  test("should not send email until previous one is used or expired", async () => {
    const user = await FactoryBot.create("user");
    const NUMBER_OF_REQUESTS = 2;

    const requests = new Array(NUMBER_OF_REQUESTS).fill(user.toJSON()).map(
      ({ email }) =>
        new Promise((resolve) => {
          server
            .executeOperation({
              query,
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
    expect(mailer.sendEmail).toBeCalledTimes(1);
  });
});
