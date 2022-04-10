import db from "~db/models";
import fileStorage from "~utils/fileStorage";
import attributes from "tests/attributes";

fileStorage.remove = jest.fn().mockReturnValueOnce(Promise.resolve());

describe("File", () => {
  describe("association", () => {
    test("should not delete user on delete", async () => {
      const user = await db.User.create(attributes.user());
      const file = await db.File.create(attributes.file());
      await user.setAvatar(file);

      await file.destroy();

      const userExist = await db.User.findByPk(user.id);

      expect(userExist).toBeDefined();
    });
  });
});
