import { gql } from "apollo-server-express";
import mailer from "~utils/mailer";
import createApolloTestServer from "tests/mocks/apolloServer";
import UserFactory from "tests/factories/user";

jest.mock("~utils/mailer", () => {
  return {
    sendEmail: jest.fn(),
  };
});

const query = gql`
  mutation RequestEmailOTP($email: EmailAddress!) {
    requestEmailOTP(email: $email) {
      success
      message
      code
    }
  }
`;

describe("Mutation.requestEmailOTP", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  test("should send an email to a verified user", async () => {
    const currentUser = await UserFactory.create({
      emailVerified: true,
    });
    await server.executeOperation({
      query,
      variables: {
        email: currentUser.email,
      },
    });
    expect(mailer.sendEmail).toBeCalledTimes(1);
  });

  test("should not send an email to unverified user", async () => {
    const currentUser = await UserFactory.create();
    await server.executeOperation({
      query,
      variables: {
        email: currentUser.email,
      },
    });
    expect(mailer.sendEmail).toBeCalledTimes(0);
  });
});
