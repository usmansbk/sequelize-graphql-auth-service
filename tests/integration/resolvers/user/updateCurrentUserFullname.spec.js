import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation UpdateCurrentUserFullname($input: UpdateFullnameInput!) {
    updateCurrentUserFullname(input: $input) {
      user {
        firstName
        lastName
      }
    }
  }
`;

describe("Mutation.updateCurrentUserFullname", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll((done) => {
    server.stop().then(done);
  });

  beforeEach(async () => {
    await FactoryBot.truncate();
  });

  test("should update current user fullName", async () => {
    const currentUser = await FactoryBot.create("user");
    const expectedResult = {
      firstName: "Adam",
      lastName: "Savage",
    };

    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: expectedResult,
        },
      },
      { currentUser }
    );
    expect(res.data.updateCurrentUserFullname.user).toEqual(expectedResult);
  });
});
