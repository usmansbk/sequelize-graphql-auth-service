import { gql } from "apollo-server-express";
import db from "~db/models";
import fileStorage from "~utils/fileStorage";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";
import store from "~utils/store";

fileStorage.remove = jest.fn().mockReturnValueOnce(Promise.resolve());

const query = gql`
  mutation RemoveProfilePicture {
    removeCurrentUserAvatar {
      code
      message
      success
      user {
        avatar {
          url
        }
      }
    }
  }
`;

describe("Mutation.removeCurrentUserAvatar", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await store.clearAll();
    await server.stop();
    await db.sequelize.close();
  });

  test("should remove user avatar", async () => {
    const user = await db.User.create(attributes.user());
    await user.createAvatar(attributes.file());

    const res = await server.executeOperation(
      {
        query,
      },
      { currentUser: user }
    );
    expect(fileStorage.remove).toBeCalled();
    expect(res.data.removeCurrentUserAvatar).toEqual({
      code: "Success",
      message: "Success",
      success: true,
      user: {
        avatar: null,
      },
    });
  });

  test("should not allow unauthenticated access", async () => {
    const fields = attributes.user();
    const { errors } = await server.executeOperation({
      query,
      variables: {
        input: {
          firstName: fields.firstName,
        },
      },
    });
    expect(errors[0].message).toMatch("Unauthenticated");
  });
});
