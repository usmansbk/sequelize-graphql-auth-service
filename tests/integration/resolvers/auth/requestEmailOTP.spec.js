import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";
import mailer from "~utils/mailer";

mailer.sendEmail = jest.fn();

const REQUEST_EMAIL_OTP = gql`
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

  afterAll(() => {
    server.stop();
    db.sequelize.close();
  });

  test("should not be accessed by unauthenticated users", async () => {
    const { errors } = await server.executeOperation({
      query: REQUEST_EMAIL_OTP,
    });
    expect(errors[0].message).toBe("Unauthenticated");
  });

  test("should send an email to a verified user", async () => {
    const loggedInUser = await db.User.create(
      attributes.user({ emailVerified: true })
    );
    await server.executeOperation(
      {
        query: REQUEST_EMAIL_OTP,
      },
      { tokenInfo: { sub: loggedInUser.id } }
    );
    expect(mailer.sendEmail.mock.calls.length).toBe(1);
  });

  test("should not send an email to unverified user", async () => {
    const loggedInUser = await db.User.create(attributes.user());
    await server.executeOperation(
      {
        query: REQUEST_EMAIL_OTP,
      },
      { tokenInfo: { sub: loggedInUser.id } }
    );
    expect(mailer.sendEmail.mock.calls.length).toBe(0);
  });
});
