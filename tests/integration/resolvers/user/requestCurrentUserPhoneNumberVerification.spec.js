import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import mailer from "~utils/mailer";

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
      user {
        id
        phoneNumberVerified
      }
    }
  }
`;

describe("Mutation.requestCurrentUserPhoneNumberVerification", () => {
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

  test("should not be accessed by unauthenticated users", async () => {
    const { errors } = await server.executeOperation({
      query,
      variables: {
        phoneNumber: FactoryBot.attributesFor("user").phoneNumber,
      },
    });
    expect(errors[0].message).toMatch("Unauthenticated");
  });

  test("should send an sms to logged-in user", async () => {
    const currentUser = await FactoryBot.create("user", {
      phoneNumberVerified: true,
    });
    const res = await server.executeOperation(
      {
        query,
        variables: {
          phoneNumber: FactoryBot.attributesFor("user").phoneNumber,
        },
      },
      { currentUser }
    );
    expect(mailer.sendSMS).toBeCalledTimes(1);
    expect(res.data.requestCurrentUserPhoneNumberVerification).toEqual({
      code: "SentSmsOtp",
      message: "SentSmsOtp",
      success: true,
      user: {
        id: currentUser.id,
        phoneNumberVerified: false,
      },
    });
  });

  test("should unverify phone number", async () => {
    const currentUser = await FactoryBot.create("user", {
      phoneNumberVerified: true,
    });
    const res = await server.executeOperation(
      {
        query,
        variables: {
          phoneNumber: FactoryBot.attributesFor("user").phoneNumber,
        },
      },
      { currentUser }
    );

    expect(res.data.requestCurrentUserPhoneNumberVerification).toEqual({
      code: "SentSmsOtp",
      message: "SentSmsOtp",
      success: true,
      user: {
        id: currentUser.id,
        phoneNumberVerified: false,
      },
    });
  });
});
