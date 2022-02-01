import { gql } from "apollo-server-express";
import db from "~db/models";
import mailer from "~utils/mailer";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";

jest.mock("~utils/mailer", () => {
  return {
    sendEmail: jest.fn(),
  };
});

const query = gql`
  mutation RequestEmailOTP {
    requestEmailOTP {
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
    await db.sequelize.close();
  });

  test("should not be accessed by unauthenticated users", async () => {
    const { errors } = await server.executeOperation({
      query,
    });
    expect(errors[0].message).toBe("Unauthenticated");
  });

  test("should send an email to a verified user", async () => {
    const loggedInUser = await db.User.create(
      attributes.user({ emailVerified: true })
    );
    await server.executeOperation(
      {
        query,
      },
      { tokenInfo: { sub: loggedInUser.id } }
    );
    expect(mailer.sendEmail).toBeCalledTimes(1);
  });

  test("should not send an email to unverified user", async () => {
    const loggedInUser = await db.User.create(attributes.user());
    await server.executeOperation(
      {
        query,
      },
      { tokenInfo: { sub: loggedInUser.id } }
    );
    expect(mailer.sendEmail).toBeCalledTimes(0);
  });
});
