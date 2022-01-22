import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";

const EXAMPLE_QUERY = gql`
  mutation Example($arg: ExampleArg!) {
    example(arg: $arg) {
      message
    }
  }
`;

describe("Mutation.example", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(() => {
    server.stop();
    db.sequelize.close();
  });

  test("should serve as a template", async () => {
    const res = await server.executeOperation({
      query: EXAMPLE_QUERY,
      variables: {
        input: attributes.user(),
      },
    });
    expect(res).toMatchSnapshot();
  });
});
