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

  test("should register a new user with correct inputs", async () => {
    const res = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: attributes.user(),
      },
    });
    expect(res).toMatchSnapshot();
  });

  test("should not register a user with existing email", async () => {
    const existingUser = await db.User.create(attributes.user());
    const res = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: attributes.user({ email: existingUser.email }),
      },
    });
    expect(res).toMatchSnapshot();
  });
});
