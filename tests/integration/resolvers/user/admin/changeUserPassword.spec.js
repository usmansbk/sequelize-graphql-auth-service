import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation ChangeUserPassword($input: ChangeUserPasswordInput!) {
    changeUserPassword(input: $input) {
      code
      message
      errors {
        field
        message
      }
    }
  }
`;

describe("Mutation.changeUserPassword", () => {
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

  test("should allow admin to change other users password", async () => {
    const currentUser = await FactoryBot.create("user", {
      include: {
        roles: {
          name: "admin",
        },
      },
    });
    const otherUser = await FactoryBot.create("user");

    const { password } = FactoryBot.attributesFor("user");
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: otherUser.id,
            password,
          },
        },
      },
      { currentUser }
    );

    await otherUser.reload();
    const passwordMatch = await otherUser.checkPassword(password);
    expect(passwordMatch).toBe(true);
  });

  test("should not allow non-admin to change users password", async () => {
    const currentUser = await FactoryBot.create("user");
    const otherUser = await FactoryBot.create("user");

    const { password } = FactoryBot.attributesFor("user");
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: otherUser.id,
            password,
          },
        },
      },
      { currentUser }
    );

    expect(res.errors[0].message).toBe("Unauthorized");
  });
});
