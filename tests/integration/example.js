import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";

const REGISTER_WITH_EMAIL = gql`
  mutation RegisterWithEmail($input: CreateUserInput!) {
    registerWithEmail(input: $input) {
      code
      message
      accessToken
      refreshToken
    }
  }
`;

describe("Mutation.registerWithEmail", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(() => {
    server.stop();
    db.sequelize.close();
  });

  test("should create a new user", async () => {
    const res = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: attributes.user(),
      },
    });
    expect(res).toMatchSnapshot();
  });
});
