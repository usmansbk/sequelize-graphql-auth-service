import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation ChangeUserEmail($input: ChangeUserEmailInput!) {
    changeUserEmail(input: $input) {
      code
      message
      errors {
        field
        message
      }
      user {
        email
      }
    }
  }
`;

describe("Mutation.changeUserEmail", () => {
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

  test("should allow admin to change other users email", async () => {
    const currentUser = await FactoryBot.create("user", {
      include: {
        roles: {
          name: "admin",
        },
      },
    });
    const otherUser = await FactoryBot.create("user");

    const { email } = FactoryBot.attributesFor("user");
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: otherUser.id,
            email,
          },
        },
      },
      { currentUser }
    );

    expect(res.data.changeUserEmail.user).toEqual({ email });
  });

  test("should not allow non-admin to change users email", async () => {
    const currentUser = await FactoryBot.create("user");
    const otherUser = await FactoryBot.create("user");

    const { email } = FactoryBot.attributesFor("user");
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: otherUser.id,
            email,
          },
        },
      },
      { currentUser }
    );

    expect(res.errors[0].message).toBe("Unauthorized");
  });
});
