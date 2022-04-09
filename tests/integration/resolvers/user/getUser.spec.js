import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";
import store from "~utils/store";

const query = gql`
  query getUserById($id: ID!) {
    getUserById(id: $id) {
      code
      message
      success
      user {
        id
      }
    }
  }
`;

describe("Query.getUserById", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await store.clearAll();
    await server.stop();
    await db.sequelize.close();
  });

  test("should return user by id", async () => {
    const user = await db.User.create(attributes.user());

    const res = await server.executeOperation(
      {
        query,
        variables: {
          id: user.id,
        },
      },
      { currentUser: user }
    );
    expect(res.data.getUserById).toEqual({
      code: "Success",
      message: "Success",
      success: true,
      user: {
        id: user.id,
      },
    });
  });

  test("should return null user if not found", async () => {
    const user = await db.User.create(attributes.user());
    const unregisteredUser = db.User.build(attributes.user());

    const res = await server.executeOperation(
      {
        query,
        variables: {
          id: unregisteredUser.id,
        },
      },
      { currentUser: user }
    );
    expect(res.data.getUserById).toEqual({
      code: "UserNotFound",
      message: "UserNotFound",
      success: false,
      user: null,
    });
  });

  test("should not allow unauthenticated access", async () => {
    const { errors } = await server.executeOperation({
      query,
      variables: {
        id: "id",
      },
    });
    expect(errors[0].message).toMatch("Unauthenticated");
  });
});
