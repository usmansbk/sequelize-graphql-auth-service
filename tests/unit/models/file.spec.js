import fileStorage from "~utils/fileStorage";
import FactoryBot from "tests/factories";

fileStorage.remove = jest.fn().mockReturnValueOnce(Promise.resolve());

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
