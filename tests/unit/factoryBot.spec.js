import FactoryBot from "tests/factories";
import db from "~db/models";

describe("FactoryBot", () => {
  describe("#create", () => {
    test("should create new model instance", async () => {
      const user = await FactoryBot.create("user");

      expect(user).toBeInstanceOf(db.User);
    });

    test("should create new model instance with association", async () => {
      const user = await FactoryBot.create("user", {
        include: {
          roles: {},
        },
      });

      const count = await user.countRoles();

      expect(count).toBe(1);
    });

    test("should create new model instance with nested association", async () => {
      const user = await FactoryBot.create("user", {
        include: {
          roles: {
            include: {
              permissions: {},
            },
          },
        },
      });

      const [role] = await user.getRoles();
      const count = await role.countPermissions();

      expect(count).toBe(1);
    });

    test("should create new model instance with multiple associations using _count option", async () => {
      const user = await FactoryBot.create("user", {
        include: {
          roles: {
            _count: 3,
          },
        },
      });

      const count = await user.countRoles();

      expect(count).toBe(3);
    });

    test("should create new model instance with multiple associations using array values", async () => {
      const user = await FactoryBot.create("user", {
        include: {
          roles: [{}, {}],
        },
      });

      const count = await user.countRoles();

      expect(count).toBe(2);
    });
  });

  describe("#truncate", () => {
    test("should delete all created rows", async () => {
      await FactoryBot.create("user");
      await FactoryBot.create("role");

      await FactoryBot.truncate();

      const users = await FactoryBot.db("user").findAll();
      const roles = await FactoryBot.db("role").findAll();

      expect(users).toHaveLength(0);
      expect(roles).toHaveLength(0);
    });

    test("should cascade delete", async () => {
      await FactoryBot.create("user", {
        include: {
          avatar: {},
          roles: {
            include: {
              permissions: {
                include: {
                  members: {},
                },
              },
            },
          },
        },
      });

      await FactoryBot.truncate();

      const users = await FactoryBot.db("user").findAll();
      const roles = await FactoryBot.db("role").findAll();
      const permissions = await FactoryBot.db("permission").findAll();
      const files = await FactoryBot.db("file").findAll();

      expect(users).toHaveLength(0);
      expect(roles).toHaveLength(0);
      expect(permissions).toHaveLength(0);
      expect(files).toHaveLength(0);
    });
  });
});
