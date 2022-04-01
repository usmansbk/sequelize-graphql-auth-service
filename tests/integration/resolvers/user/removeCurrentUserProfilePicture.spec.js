import { gql } from "apollo-server-express";
import db from "~db/models";
import fileStorage from "~utils/fileStorage";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";
import store from "~utils/store";

fileStorage.remove = jest.fn();

const query = gql`
  mutation RemoveProfilePicture {
    removeCurrentUserProfilePicture {
      code
      message
      success
      user {
        picture {
          url
        }
      }
    }
  }
`;

describe("Mutation.removeCurrentUserProfilePicture", () => {
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
    const user = await db.User.create(
      attributes.user({ avatar: { key: "aws-s3-key" } })
    );

    const res = await server.executeOperation(
      {
        query,
      },
      { tokenInfo: { sub: user.id }, currentUser: user }
    );
    expect(fileStorage.remove).toBeCalled();
    expect(res.data.removeCurrentUserProfilePicture).toEqual({
      code: "Success",
      message: "Success",
      success: true,
      user: {
        picture: null,
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
