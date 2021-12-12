import { gql } from "apollo-server-express";
import startServer from "~graph-api";
import UserFactory from "../../factories/user";

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
        input: UserFactory.attributes(),
      },
    });

    expect(result.data?.registerWithEmail.success).toBe(true);
  });

  test("register with used email", async () => {
    const existingUser = await UserFactory.create();
    const result = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: UserFactory.attributes({ email: existingUser.email }),
      },
    });

    expect(result.data?.registerWithEmail.success).toBe(false);
  });

  test("register with used phoneNumber", async () => {
    const existingUser = await UserFactory.create();
    const result = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: UserFactory.attributes({
          phoneNumber: existingUser.phoneNumber,
        }),
      },
    });

    expect(result.data?.registerWithEmail.success).toBe(false);
  });
});
