import { gql } from "apollo-server-express";
import startServer from "~graph-api";
import db from "~db/models";
import { userAttributes } from "../../attributes";

const { User } = db;

const LOGIN_WITH_EMAIL = gql`
  mutation LoginWithEmail($input: EmailLoginInput!) {
    loginWithEmail(input: $input) {
      message
      success
      token
    }
  }
`;

describe("loginWithEmail", () => {
  let server, attr;

  beforeAll(async () => {
    attr = userAttributes();
    await User.create(attr);
    server = await startServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  test("login with correct email and password", async () => {
    const result = await server.executeOperation({
      query: LOGIN_WITH_EMAIL,
      variables: {
        input: {
          email: attr.email,
          password: attr.password,
        },
      },
    });

    expect(result.data?.loginWithEmail.success).toBe(true);
  });

  test("login with incorrect email and password", async () => {
    const result = await server.executeOperation({
      query: LOGIN_WITH_EMAIL,
      variables: {
        input: {
          email: "fakeemail",
          password: "fakepassword",
        },
      },
    });

    expect(result.data?.loginWithEmail.success).toBe(true);
  });
});