import { gql } from "apollo-server-express";
import startServer from "~graph-api";
import UserFactory from "../../factories/user";

const REGISTER_WITH_EMAIL = gql`
  mutation RegisterWithEmail($input: CreateUserInput!) {
    registerWithEmail(input: $input) {
      message
      success
      token
      errors {
        message
      }
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

  test("should return authentication token", async () => {
    const result = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: UserFactory.attributes(),
      },
    });

    expect(result.data?.registerWithEmail.success).toBe(true);
  });

  test("should return field errors", async () => {
    const existingUser = await UserFactory.create();
    const result = await server.executeOperation({
      query: REGISTER_WITH_EMAIL,
      variables: {
        input: UserFactory.attributes({
          firstName: "",
          lastName: "",
          email: existingUser.email,
          phoneNumber: existingUser.phoneNumber,
          locale: "12",
        }),
      },
    });

    expect(result.data?.registerWithEmail.success).toBe(false);
  });
});
