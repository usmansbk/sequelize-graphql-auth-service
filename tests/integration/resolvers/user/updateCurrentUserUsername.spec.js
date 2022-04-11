import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation UpdateCurrentUserUsername($username: String!) {
    updateCurrentUserUsername(username: $username) {
      user {
        username
      }
    }
  }
`;

describe("Mutation.updateCurrentUserUsername", () => {
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

  test("should update current user username", async () => {
    const currentUser = await FactoryBot.create("user");

    const res = await server.executeOperation(
      {
        query,
        variables: {
          username: "Danny",
        },
      },
      { currentUser }
    );
    expect(res.data.updateCurrentUserUsername.user).toEqual({
      username: "Danny",
    });
  });
});
