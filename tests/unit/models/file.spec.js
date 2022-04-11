import storage from "~utils/storage";
import FactoryBot from "tests/factories";

describe("File", () => {
  beforeEach(async () => {
    await FactoryBot.truncate();
  });
  describe("#associations", () => {
    test("should not delete user on delete", async () => {
      const user = await FactoryBot.create("user", {
        include: {
          avatar: {},
        },
      });
      const file = user.avatar;

      await file.destroy();

      const userExist = await FactoryBot.db("user").findByPk(user.id);

      expect(userExist).toBeDefined();
    });
  });

  describe("#hooks", () => {
    test("should remove cloud storage file", async () => {
      storage.remove = jest.fn().mockReturnValueOnce(Promise.resolve());
      const file = await FactoryBot.create("file");

      await file.destroy();

      expect(storage.remove).toHaveBeenCalled();
    });
  });
});
