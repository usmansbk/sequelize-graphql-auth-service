import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation UpdateCurrentUserLocale($locale: Locale!) {
    updateCurrentUserLocale(locale: $locale) {
      user {
        locale
      }
    }
  }
`;

describe("Mutation.updateCurrentUserLocale", () => {
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

  test("should update current user locale", async () => {
    const currentUser = await FactoryBot.create("user");

    const res = await server.executeOperation(
      {
        query,
        variables: {
          locale: "fr",
        },
      },
      { currentUser }
    );
    expect(res.data.updateCurrentUserLocale.user).toEqual({
      locale: "fr",
    });
  });
});
