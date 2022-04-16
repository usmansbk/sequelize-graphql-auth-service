import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation ChangeUserStatus($input: ChangeUserStatusInput!) {
    changeUserStatus(input: $input) {
      code
      message
      errors {
        field
        message
      }
      user {
        status
      }
    }
  }
`;

describe("Mutation.changeUserStatus", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll((done) => {
    server.stop().then(done);
  });

  beforeEach(async () => {
    await FactoryBot.truncate();
  });

  test("should allow admin to change other users status", async () => {
    const currentUser = await FactoryBot.create("user", {
      include: {
        roles: {
          name: "admin",
        },
      },
    });
    const otherUser = await FactoryBot.create("user");

    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: otherUser.id,
            status: "BLOCKED",
          },
        },
      },
      { currentUser }
    );

    expect(res.data.changeUserStatus.user).toEqual({ status: "BLOCKED" });
  });

  test("should not allow non-admin to change users status", async () => {
    const currentUser = await FactoryBot.create("user");
    const otherUser = await FactoryBot.create("user");

    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: otherUser.id,
            status: "ACTIVE",
          },
        },
      },
      { currentUser }
    );

    expect(res.errors[0].message).toBe("Unauthorized");
  });
});
