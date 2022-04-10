import { gql } from "apollo-server-express";
import fileStorage from "~utils/fileStorage";
import createApolloTestServer from "tests/mocks/apolloServer";
import UserFactory from "tests/factories/user";
import FileFactory from "tests/factories/file";

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
    await server.stop();
  });

  test("should remove user avatar", async () => {
    const user = await UserFactory.create();
    await user.createAvatar(FileFactory.attributes());

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
    const fields = UserFactory.attributes();
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
