import { gql } from "apollo-server-express";
import db from "~db/models";
import mailer from "~utils/mailer";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";
import store from "~utils/store";

jest.mock("~utils/mailer", () => {
  return {
    sendSMS: jest.fn(),
  };
});

const query = gql`
  mutation RequestPhoneNumberVerification($phoneNumber: PhoneNumber!) {
    requestCurrentUserPhoneNumberVerification(phoneNumber: $phoneNumber) {
      success
      message
      code
    }
  }
`;

describe("Mutation.requestCurrentUserPhoneNumberVerification", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await store.clearAll();
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
    const currentUser = await db.User.create(attributes.user());
    const res = await server.executeOperation(
      {
        query,
        variables: {
          phoneNumber: "+2348037863727",
        },
      },
      { tokenInfo: { sub: currentUser.id }, currentUser }
    );
    expect(mailer.sendSMS).toBeCalledTimes(1);
    expect(res.data.requestCurrentUserPhoneNumberVerification).toEqual({
      code: "SentSmsOtp",
      message: "SentSmsOtp",
      success: true,
    });
  });

  test("should unverify phone number", async () => {
    const currentUser = await db.User.create(
      attributes.user({ phoneNumberVerified: true })
    );
    const res = await server.executeOperation(
      {
        query,
        variables: {
          phoneNumber: attributes.faker.phone.phoneNumber(),
        },
      },
      { tokenInfo: { sub: currentUser.id }, currentUser }
    );
    await currentUser.reload();

    expect(currentUser.phoneNumberVerified).toBe(false);
    expect(res.data.requestCurrentUserPhoneNumberVerification).toEqual({
      code: "SentSmsOtp",
      message: "SentSmsOtp",
      success: true,
    });
  });
});
