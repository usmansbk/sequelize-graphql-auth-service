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
  mutation RequestEmailVerification($email: EmailAddress!) {
    requestEmailVerification(email: $email) {
      success
      message
      code
    }
  }
`;

describe("Mutation.requestEmailVerification", () => {
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

  test("should not send an email to a verified user", async () => {
    const currentUser = await FactoryBot.create("user", {
      emailVerified: true,
    });
    await server.executeOperation({
      query,
      variables: {
        email: currentUser.email,
      },
    });
    expect(mailer.sendEmail).toBeCalledTimes(0);
  });

  test("should not send an email to non-existent user", async () => {
    await server.executeOperation({
      query,
      variables: {
        email: "me@fakemail.com",
      },
    });
    expect(mailer.sendEmail).toBeCalledTimes(0);
  });

  test("should send an email to an unverified user", async () => {
    const currentUser = await FactoryBot.create("user");
    await server.executeOperation({
      query,
      variables: {
        email: currentUser.email,
      },
    });
    expect(mailer.sendEmail).toBeCalledTimes(1);
  });
});
