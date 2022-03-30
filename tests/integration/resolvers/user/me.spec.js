import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";

const query = gql`
  query Me {
    me {
      code
      message
      success
      user {
        id
        isOwner
        picture {
          url
        }
      }
    }
  }
`;

describe("Query.me", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
    await db.sequelize.close();
  });

  test("should return current user", async () => {
    const user = await db.User.create(attributes.user());

    const res = await server.executeOperation(
      {
        query,
      },
      { tokenInfo: { sub: user.id }, currentUser: user }
    );
    expect(res.data.me).toEqual({
      code: "Success",
      message: "Success",
      success: true,
      user: {
        id: user.id,
        isOwner: true,
        picture: null,
      },
    });
  });

  test("should not allow unauthenticated access", async () => {
    const { errors } = await server.executeOperation({
      query,
    });
    expect(errors[0].message).toMatch("Unauthenticated");
  });
});
