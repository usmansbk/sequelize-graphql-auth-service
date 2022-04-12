import FactoryBot from "tests/factories";

describe("Role", () => {
  beforeEach(async () => {
    await FactoryBot.truncate();
  });
  describe("#associations", () => {
    test("should create member association", async () => {
      const role = await FactoryBot.create("role", {
        include: {
          members: {
            _count: 4,
          },
        },
      });

      const count = await role.countMembers();

      expect(count).toBe(4);
    });

    test("should count members correctly", async () => {
      const role = await FactoryBot.create("role", {
        include: {
          members: {
            _count: 3,
          },
        },
      });
      await FactoryBot.create("user");

      const count = await role.countMembers();

      expect(count).toBe(3);
    });

    test("should return members using nested query", async () => {
      const role = await FactoryBot.create("role", {
        include: {
          members: {
            _count: 3,
          },
        },
      });

      const members = await FactoryBot.db("user").findAll({
        include: {
          association: "roles",
          where: {
            id: role.id,
          },
        },
      });

      expect(members).toHaveLength(3);
    });

    test("should remove members", async () => {
      const role = await FactoryBot.create("role", {
        include: {
          members: {
            _count: 3,
          },
        },
      });

      await role.setMembers([]);

      const members = await FactoryBot.db("user").findAll({
        include: {
          association: "roles",
          where: {
            id: role.id,
          },
        },
      });

      expect(members).toHaveLength(0);
    });
  });
});
