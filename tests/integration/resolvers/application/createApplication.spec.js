import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import { CLIENTS_CACHE_KEY } from "~helpers/constants/auth";
import cache from "~utils/cache";

const query = gql`
  mutation CreateApplication($input: CreateApplicationInput!) {
    createApplication(input: $input) {
      application {
        name
        clientID
      }
    }
  }
`;

describe("Mutation.createApplication", () => {
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

  test("should create a new application", async () => {
    const input = FactoryBot.attributesFor("application");

    const res = await server.executeOperation(
      {
        query,
        variables: {
          input,
        },
      },
      { currentUser: admin }
    );

    expect(res.data.createApplication.application.name).toBe(input.name);
    expect(res.data.createApplication.application.clientID).toBeDefined();
  });

  test("should invalidate cache", async () => {
    await cache.setJSON(CLIENTS_CACHE_KEY, ["test"]);
    const input = FactoryBot.attributesFor("application");

    await server.executeOperation(
      {
        query,
        variables: {
          input,
        },
      },
      { currentUser: admin }
    );

    const cleared = await cache.get(CLIENTS_CACHE_KEY);
    expect(cleared).toBe(null);
  });
});
