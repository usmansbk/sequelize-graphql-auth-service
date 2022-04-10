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

      const users = await FactoryBot.db("user").count();
      const roles = await FactoryBot.db("role").count();

      expect(users).toBe(0);
      expect(roles).toBe(0);
    });

    test("should cascade delete", async () => {
      await FactoryBot.create("user", {
        include: {
          avatar: {},
          roles: {
            include: {
              members: {},
              permissions: {
                include: {
                  roles: {},
                },
              },
            },
          },
        },
      });

      await FactoryBot.truncate();

      const users = await FactoryBot.db("user").count();
      const roles = await FactoryBot.db("role").count();
      const permissions = await FactoryBot.db("permission").count();
      const files = await FactoryBot.db("file").count();

      expect(users).toBe(0);
      expect(roles).toBe(0);
      expect(permissions).toBe(0);
      expect(files).toBe(0);
    });
  });
});
