import { gql } from "apollo-server-express";
import createApolloTestServer from "../../apolloServer";
import { userAttributes } from "../../../factories";

const query = gql`
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
  });

  test("should create a new user", async () => {
    const res = await server.executeOperation({
      query,
      variables: {
        input: userAttributes(),
      },
    });
    expect(res).toMatchSnapshot();
  });
});
