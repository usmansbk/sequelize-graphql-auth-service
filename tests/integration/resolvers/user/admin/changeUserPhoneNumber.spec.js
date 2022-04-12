import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation ChangeUserPhoneNumber($input: ChangeUserPhoneNumberInput!) {
    changeUserPhoneNumber(input: $input) {
      code
      message
      errors {
        field
        message
      }
      user {
        phoneNumber
      }
    }
  }
`;

describe("Mutation.changeUserPhoneNumber", () => {
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

  test("should allow admin to change other users phone number", async () => {
    const currentUser = await FactoryBot.create("user", {
      include: {
        roles: {
          name: "admin",
        },
      },
    });
    const otherUser = await FactoryBot.create("user");

    const { phoneNumber } = FactoryBot.attributesFor("user");
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: otherUser.id,
            phoneNumber,
          },
        },
      },
      { currentUser }
    );

    expect(res.data.changeUserUsername.user).toEqual({ locale });
  });

  test("should not allow non-admin to change users phone number", async () => {
    const currentUser = await FactoryBot.create("user");
    const otherUser = await FactoryBot.create("user");

    const { phoneNumber } = FactoryBot.attributesFor("user");
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: otherUser.id,
            phoneNumber,
          },
        },
      },
      { currentUser }
    );

    expect(res.errors[0].message).toBe("Unauthorized");
  });
});
