import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  query Roles($page: ListPage, $filter: RoleFilter) {
    roles(page: $page, filter: $filter) {
      totalCount
      items {
        id
        members {
          totalCount
        }
      }
    }
  }
`;

describe("Query.roles", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  let admin;
  beforeAll(async () => {
    await FactoryBot.truncate();
    admin = await FactoryBot.create("user", {
      include: {
        roles: { name: "admin" },
      },
    });

    for (let i = 0; i < 3; i++) {
      await FactoryBot.create("role", {
        include: {
          members: {
            _count: 2,
          },
        },
      });
    }
  });

  test("should return list of items", async () => {
    const res = await server.executeOperation(
      {
        query,
      },
      { currentUser: admin }
    );
    expect(res.data.roles.items).toHaveLength(4);
  });

  test("should filter items", async () => {
    const res = await server.executeOperation(
      {
        query,
        variables: {
          filter: {
            where: {
              name: {
                eq: "admin",
              },
            },
          },
        },
      },
      { currentUser: admin }
    );
    expect(res.data.roles.totalCount).toBe(1);
  });
});
