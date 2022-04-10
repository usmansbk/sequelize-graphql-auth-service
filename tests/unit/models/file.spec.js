import storage from "~utils/storage";
import FactoryBot from "tests/factories";

storage.remove = jest.fn().mockReturnValueOnce(Promise.resolve());

describe("File", () => {
  describe("association", () => {
    beforeEach(async () => {
      await FactoryBot.truncate();
    });

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
});
