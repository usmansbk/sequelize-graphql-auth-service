import FactoryBot from "tests/factories";

describe("Role", () => {
  beforeEach(async () => {
    await FactoryBot.truncate();
  });
  describe("#associations", () => {
    test("should create member association", async () => {
      const role = await FactoryBot.create("role", {
        include: {
          member: {
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
          member: {
            _count: 3,
          },
        },
      });
      await FactoryBot.create("user");

      const count = await role.countMembers();

      expect(count).toBe(3);
    });

    test("should remove members association", async () => {
      const role = await FactoryBot.create("role", {
        include: {
          member: {
            _count: 3,
          },
        },
      });
      await role.setMember([]);

      const count = await role.countMembers();
      const members = await FactoryBot.db("user").findAll({
        include: {
          association: "roles",
          where: {
            id: role.id,
          },
        },
      });

      expect(count).toBe(0);
      expect(members).toHaveLength(0);
    });
  });
});
