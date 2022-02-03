import { gql } from "apollo-server-express";
import db from "~db/models";
import mailer from "~utils/mailer";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";

jest.mock("~utils/mailer", () => {
  return {
    sendSMS: jest.fn(),
  };
});

const query = gql`
  mutation RequestPhoneNumberVerification($phoneNumber: String!) {
    requestPhoneNumberVerification(phoneNumber: $phoneNumber) {
      success
      message
      code
    }
  }
`;

describe("Mutation.requestPhoneNumberVerification", () => {
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
      variables: {
        phoneNumber: "+2348037863727",
      },
    });
    expect(errors[0].message).toMatch("Unauthenticated");
  });

  test("should send an sms to logged-in user", async () => {
    const loggedInUser = await db.User.create(attributes.user());
    const res = await server.executeOperation(
      {
        query,
        variables: {
          phoneNumber: "+2348037863727",
        },
      },
      { tokenInfo: { sub: loggedInUser.id } }
    );
    expect(mailer.sendSMS).toBeCalledTimes(1);
    expect(res.data.requestPhoneNumberVerification).toEqual({
      code: "SentSmsOtp",
      message: "SentSmsOtp",
      success: true,
    });
  });

  test("should unverify phone number", async () => {
    const loggedInUser = await db.User.create(
      attributes.user({ phoneNumberVerified: true })
    );
    const res = await server.executeOperation(
      {
        query,
        variables: {
          phoneNumber: attributes.faker.phone.phoneNumber(),
        },
      },
      { tokenInfo: { sub: loggedInUser.id } }
    );
    await loggedInUser.reload();

    expect(loggedInUser.phoneNumberVerified).toBe(false);
    expect(res.data.requestPhoneNumberVerification).toEqual({
      code: "SentSmsOtp",
      message: "SentSmsOtp",
      success: true,
    });
  });
});
