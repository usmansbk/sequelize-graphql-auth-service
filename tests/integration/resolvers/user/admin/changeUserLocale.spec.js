import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation ChangeUserLocale($input: ChangeUserLocaleInput!) {
    changeUserLocale(input: $input) {
      code
      message
      errors {
        field
        message
      }
      user {
        locale
      }
    }
  }
`;

describe("Mutation.changeUserLocale", () => {
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

  test("should allow admin to change other users locale", async () => {
    const currentUser = await FactoryBot.create("user", {
      include: {
        roles: {
          name: "admin",
        },
      },
    });
    const otherUser = await FactoryBot.create("user");

    const { locale } = FactoryBot.attributesFor("user");
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: otherUser.id,
            locale,
          },
        },
      },
      { currentUser }
    );

    expect(res.data.changeUserUsername.user).toEqual({ locale });
  });

  test("should not allow non-admin to change users locale", async () => {
    const currentUser = await FactoryBot.create("user");
    const otherUser = await FactoryBot.create("user");

    const { locale } = FactoryBot.attributesFor("user");
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: otherUser.id,
            locale,
          },
        },
      },
      { currentUser }
    );

    expect(res.errors[0].message).toBe("Unauthorized");
  });
});
