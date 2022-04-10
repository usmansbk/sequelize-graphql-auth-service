import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import mailer from "~utils/mailer";

const query = gql`
  mutation RequestDeleteAccount {
    requestDeleteAccount {
      code
      message
      success
    }
  }
`;

jest.mock("~utils/mailer", () => {
  return {
    sendEmail: jest.fn(),
  };
});

describe("Mutation.requestDeleteAccount", () => {
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

  test("should send a delete account email to a logged in user", async () => {
    const currentUser = await FactoryBot.create("user");
    const res = await server.executeOperation({ query }, { currentUser });
    expect(mailer.sendEmail).toBeCalledTimes(1);
    expect(res.data.requestDeleteAccount).toEqual({
      code: "SentDeleteConfirmationEmail",
      message: "SentDeleteConfirmationEmail",
      success: true,
    });
  });

  test("should send email only when previous link is used or expired", async () => {
    const currentUser = await FactoryBot.create("user");
    const NUMBER_OF_REQUESTS = 2;

    for (let i = 0; i < NUMBER_OF_REQUESTS; i++) {
      await server.executeOperation({ query }, { currentUser });
    }
    expect(mailer.sendEmail).toBeCalledTimes(1);
  });

  test("should not allow unauthenticated users", async () => {
    const res = await server.executeOperation({ query });
    expect(res.errors[0].message).toMatch("Unauthenticated");
  });
});
