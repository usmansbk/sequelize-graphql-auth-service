import fileStorage from "~utils/fileStorage";
import FactoryBot from "tests/factories";

fileStorage.remove = jest.fn().mockReturnValueOnce(Promise.resolve());

describe("User", () => {
  describe("association", () => {
    test("should remove avatar on delete", async () => {
      const user = await FactoryBot.create("user");
      const file = await FactoryBot.create("file");
      await user.setAvatar(file);

      await user.destroy();

      const deleted = await FactoryBot.db("file").findByPk(file.id);

      expect(deleted).toBe(null);
      expect(fileStorage.remove).toBeCalled();
    });
  });
});
