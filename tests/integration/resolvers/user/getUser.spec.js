import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import UserFactory from "tests/factories/user";

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
    await server.stop();
  });

  test("should return user by id", async () => {
    const user = await UserFactory.create();

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
    const user = await UserFactory.create();
    const unregisteredUser = UserFactory.build();

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
