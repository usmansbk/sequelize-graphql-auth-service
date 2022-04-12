import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation RemoveUserAvatar($input: RemoveUserAvatarInput!) {
    removeUserAvatar(input: $input) {
      code
      message
      user {
        avatar {
          url
        }
      }
    }
  }
`;

describe("Mutation.changeUserStatus", () => {
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

  test("should allow admin to remove other users avatar", async () => {
    const currentUser = await FactoryBot.create("user", {
      include: {
        roles: {
          name: "admin",
        },
      },
    });
    const otherUser = await FactoryBot.create("user", {
      include: {
        avatar: {},
      },
    });

    const res = await server.executeOperation(
      {
        query,
        variables: {
          id: otherUser.id,
        },
      },
      { currentUser }
    );

    expect(res.data.changeUserUsername.user).toEqual({ avatar: null });
  });

  test("should not allow non-admin to remove other user avatar", async () => {
    const currentUser = await FactoryBot.create("user");
    const otherUser = await FactoryBot.create("user");

    const res = await server.executeOperation(
      {
        query,
        variables: {
          id: otherUser.id,
        },
      },
      { currentUser }
    );

    expect(res.errors[0].message).toBe("Unauthorized");
  });
});
