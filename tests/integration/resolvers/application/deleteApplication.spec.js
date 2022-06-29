import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import { CLIENTS_CACHE_KEY } from "~helpers/constants/auth";
import cache from "~utils/cache";

const query = gql`
  mutation DeleteApplication($id: ID!) {
    deleteApplication(id: $id) {
      code
      message
      id
    }
  }
`;

describe("Mutation.deleteApplication", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll((done) => {
    server.stop().then(done);
  });

  let admin;
  beforeEach(async () => {
    await FactoryBot.truncate();
    admin = await FactoryBot.create("user", {
      include: {
        roles: {
          name: "admin",
        },
      },
    });
  });

  test("should delete an application", async () => {
    const app = await FactoryBot.create("application");

    const res = await server.executeOperation(
      {
        query,
        variables: {
          id: app.id,
        },
      },
      { currentUser: admin }
    );

    expect(res.data.deleteApplication.id).toBe(app.id);
  });

  test("should invalidate cache", async () => {
    const app = await FactoryBot.create("application");
    await cache.setJSON(CLIENTS_CACHE_KEY, [app.clientID]);

    await server.executeOperation(
      {
        query,
        variables: {
          id: app.id,
        },
      },
      { currentUser: admin }
    );

    const cleared = await cache.get(CLIENTS_CACHE_KEY);
    expect(cleared).toBe(null);
  });
});
