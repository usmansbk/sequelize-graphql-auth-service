import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

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
});
