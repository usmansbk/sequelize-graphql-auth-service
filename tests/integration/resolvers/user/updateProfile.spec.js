import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";

const query = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      code
      message
      success
      user {
        id
        fullName
        phoneNumberVerified
      }
    }
  }
`;

describe("Mutation.updateProfile", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
    await db.sequelize.close();
  });

  test("should update current user profile", async () => {
    const user = await db.User.create(
      attributes.user({ phoneNumberVerified: true })
    );
    const newFields = attributes.user();
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            firstName: newFields.firstName,
            lastName: newFields.lastName,
            phoneNumber: newFields.phoneNumber,
          },
        },
      },
      { tokenInfo: { sub: user.id }, currentUser: user }
    );
    expect(res.data.updateProfile).toEqual({
      code: "ProfileUpdated",
      message: "ProfileUpdated",
      success: true,
      user: {
        id: user.id,
        fullName: [newFields.firstName, newFields.lastName].join(" "),
        phoneNumberVerified: false,
      },
    });
  });

  test("should not allow unauthenticated access", async () => {
    const fields = attributes.user();
    const { errors } = await server.executeOperation({
      query,
      variables: {
        input: {
          firstName: fields.firstName,
        },
      },
    });
    expect(errors[0].message).toMatch("Unauthenticated");
  });
});
