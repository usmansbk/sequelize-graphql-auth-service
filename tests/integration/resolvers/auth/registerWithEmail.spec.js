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

  test("should register a new user and return the access and refresh tokens", async () => {
    const res = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: attributes.user(),
      },
    });
    expect(res).toMatchSnapshot();
  });

  test("should not register a user if the email is already taken and verified by an existing user", async () => {
    const existingUser = await db.User.create(
      attributes.user({ emailVerified: true })
    );
    const res = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: attributes.user({ email: existingUser.email }),
      },
    });
    expect(res).toMatchSnapshot();
  });

  test("should register a new user if the email is taken but unverified", async () => {
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
