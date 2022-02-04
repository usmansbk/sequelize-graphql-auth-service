import { gql } from "apollo-server-express";
import db from "~db/models";
import files from "~utils/files";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";

files.remove = jest.fn();

const query = gql`
  mutation RemoveProfilePicture {
    removeProfilePicture {
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

describe("Mutation.removeProfilePicture", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
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
      { tokenInfo: { sub: user.id } }
    );
    expect(files.remove).toBeCalled();
    expect(res.data.removeProfilePicture).toEqual({
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
