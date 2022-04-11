import FactoryBot from "tests/factories";

describe("User", () => {
  beforeEach(async () => {
    await FactoryBot.truncate();
  });
  describe("#associations", () => {
    test("should remove avatar on destroy", async () => {
      const user = await FactoryBot.create("user", {
        include: {
          avatar: {},
        },
      });
      const file = user.avatar;

      await user.destroy();
      const deletedFile = await FactoryBot.db("file").findByPk(file.id);

      expect(deletedFile).toBe(null);
    });

    test("should not cascade role on destroy", async () => {
      const user = await FactoryBot.create("user", {
        include: {
          roles: {
            _count: 4,
          },
        },
      });

      await user.destroy();
      const count = await FactoryBot.db("role").count();

      expect(count).toBe(4);
    });
  });
});
