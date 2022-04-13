import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  query Me {
    me {
      code
      message
      success
      user {
        id
        isOwner
        avatar {
          url
        }
      }
    }
  }
`;

describe("Query.me", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll((done) => {
    server.stop().then(done);
  });

  beforeEach(async () => {
    await FactoryBot.truncate();
  });

  test("should return current user", async () => {
    const user = await FactoryBot.create("user");

    const res = await server.executeOperation(
      {
        query,
      },
      { currentUser: user }
    );
    expect(res.data.me).toEqual({
      code: "Success",
      message: "Success",
      success: true,
      user: {
        id: user.id,
        isOwner: true,
        avatar: null,
      },
    });
  });

  test("should not allow unauthenticated access", async () => {
    const { errors } = await server.executeOperation({
      query,
    });
    expect(errors[0].message).toMatch("Unauthenticated");
  });
});
