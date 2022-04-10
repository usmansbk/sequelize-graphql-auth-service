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

  afterEach(async () => {
    await FactoryBot.truncate();
  });

  test("should send an email to a verified user", async () => {
    const currentUser = await FactoryBot.create("user", {
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
    const currentUser = await FactoryBot.create("user");
    await server.executeOperation({
      query,
      variables: {
        email: currentUser.email,
      },
    });
    expect(mailer.sendEmail).toBeCalledTimes(0);
  });
});
