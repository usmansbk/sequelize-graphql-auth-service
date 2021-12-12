import { gql } from "apollo-server-express";
import startServer from "~graph-api";
import db from "~db/models";
import { userAttributes } from "../../attributes";

const { User } = db;

const REGISTER_WITH_EMAIL = gql`
  mutation RegisterWithEmail($input: CreateUserInput!) {
    registerWithEmail(input: $input) {
      message
      success
      token
    }
  }
`;

describe("registerWithEmail", () => {
  let server;

  beforeAll(async () => {
    server = await startServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  test("register with new email", async () => {
    const result = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: userAttributes({ email: "test@email.com" }),
      },
    });

    expect(result.data?.registerWithEmail.success).toBe(true);
  });

  test("register with used email", async () => {
    const user = await User.create(userAttributes());
    const result = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: userAttributes({ email: user.email }),
      },
    });

    expect(result.data?.registerWithEmail.success).toBe(true);
  });
});
