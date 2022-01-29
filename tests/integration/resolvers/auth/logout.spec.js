import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";

const query = gql`
  mutation Logout($all: Boolean) {
    logout(all: $all) {
      code
      success
      message
    }
  }
`;

describe("Mutation.logout", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
    await db.sequelize.close();
  });

  test("should logout user from current client", async () => {
    const res = await server.executeOperation({ query });
    expect(res.data.logout).toEqual({
      code: "LoggedOut",
      success: true,
      message: "LoggedOut",
    });
  });

  test("should logout user from all clients", async () => {
    const res = await server.executeOperation({
      query,
      variables: {
        all: true,
      },
    });
    expect(res.data.logout).toEqual({
      code: "LoggedOut",
      success: true,
      message: "LoggedOut",
    });
  });
});
