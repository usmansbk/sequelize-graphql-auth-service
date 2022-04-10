import fileStorage from "~utils/fileStorage";
import FactoryBot from "tests/factories";

fileStorage.remove = jest.fn().mockReturnValueOnce(Promise.resolve());

describe("File", () => {
  describe("association", () => {
    afterEach(async () => {
      await FactoryBot.truncate();
    });

    test("should not delete user on delete", async () => {
      const user = await FactoryBot.create("user");
      const file = await FactoryBot.create("file");
      await user.setAvatar(file);

      await file.destroy();

      const userExist = await FactoryBot.db("user").findByPk(user.id);

      expect(userExist).toBeDefined();
    });
  });
});
