import fileStorage from "~utils/fileStorage";
import UserFactory from "tests/factories/user";
import FileFactory from "tests/factories/file";

fileStorage.remove = jest.fn().mockReturnValueOnce(Promise.resolve());

describe("User", () => {
  describe("association", () => {
    test("should remove avatar on delete", async () => {
      const user = await UserFactory.create();
      const file = await FileFactory.create();
      await user.setAvatar(file);

      await user.destroy();

      const deleted = await FileFactory.model.findByPk(file.id);

      expect(deleted).toBe(null);
      expect(fileStorage.remove).toBeCalled();
    });
  });
});
