import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation UpdateApplication($input: UpdateApplicationInput!) {
    updateApplication(input: $input) {
      code
      message
      application {
        name
      }
    }
  }
`;

describe("Mutation.updateApplication", () => {
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

  test("should update application details", async () => {
    const app = await FactoryBot.create("application", {
      name: "test1",
    });

    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: app.id,
            name: "test2",
          },
        },
      },
      { currentUser: admin }
    );

    expect(res.data.updateApplication.application).toEqual({
      name: "test2",
    });
  });
});
