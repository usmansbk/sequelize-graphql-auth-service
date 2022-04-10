import fileStorage from "~utils/fileStorage";
import UserFactory from "tests/factories/user";
import FileFactory from "tests/factories/file";

fileStorage.remove = jest.fn().mockReturnValueOnce(Promise.resolve());

describe("File", () => {
  describe("association", () => {
    test("should not delete user on delete", async () => {
      const user = await UserFactory.create();
      const file = await FileFactory.create();
      await user.setAvatar(file);

      await file.destroy();

      const userExist = await UserFactory.model.findByPk(user.id);

      expect(userExist).toBeDefined();
    });
  });
});
