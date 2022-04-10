import { gql } from "apollo-server-express";
import mailer from "~utils/mailer";
import createApolloTestServer from "tests/mocks/apolloServer";
import UserFactory from "tests/factories/user";

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
    const currentUser = await UserFactory.create({
      phoneNumberVerified: true,
    });
    const res = await server.executeOperation(
      {
        query,
        variables: {
          phoneNumber: "+2348037863727",
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
    const currentUser = await UserFactory.create({
      phoneNumberVerified: true,
    });
    const res = await server.executeOperation(
      {
        query,
        variables: {
          phoneNumber: UserFactory.attributes().phoneNumber,
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
