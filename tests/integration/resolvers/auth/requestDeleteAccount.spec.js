import { gql } from "apollo-server-express";
import db from "~db/models";
import mailer from "~utils/mailer";
import createApolloTestServer from "tests/support/apolloServer";
import attributes from "tests/attributes";
import store from "~utils/store";

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
    await store.clearAll();
    await server.stop();
    await db.sequelize.close();
  });

  test("should send a delete account email to a logged in user", async () => {
    const currentUser = await db.User.create(attributes.user());
    const res = await server.executeOperation({ query }, { currentUser });
    expect(mailer.sendEmail).toBeCalledTimes(1);
    expect(res.data.requestDeleteAccount).toEqual({
      code: "SentDeleteConfirmationEmail",
      message: "SentDeleteConfirmationEmail",
      success: true,
    });
  });

  test("should send email only when previous link is used or expired", async () => {
    const currentUser = await db.User.create(attributes.user());
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
