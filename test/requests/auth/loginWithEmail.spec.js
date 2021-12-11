import { gql } from "apollo-server-express";
import startServer from "~graph-api";
import db from "~db/models";
import mockUser from "../../mocks/user";

const { User, sequelize } = db;

const LOGIN_WITH_EMAIL = gql`
  mutation LoginWithEmail($input: EmailLoginInput!) {
    message
    success
    token
  }
`;

describe("loginWithEmail", () => {
  let user, server;

  beforeAll(async () => {
    await User.sync({ force: true });
    user = await User.create(mockUser);
    server = await startServer();
  });

  afterAll(async () => {
    await User.drop();
    await sequelize.close();
  });

  test("login with correct email and password", async () => {
    const result = await server.executeOperation({
      query: LOGIN_WITH_EMAIL,
      variables: {
        email: mockUser.email,
        password: mockUser.password,
      },
    });

    expect(result.data?.loginWitEmail.success).toBe(true);
  });
});
