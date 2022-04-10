import db from "~db/models";
import fileStorage from "~utils/fileStorage";
import attributes from "tests/attributes";

fileStorage.remove = jest.fn().mockReturnValueOnce(Promise.resolve());

describe("User", () => {
  describe("association", () => {
    test("should remove avatar on delete", async () => {
      const user = await db.User.create(attributes.user());
      const file = await db.File.create(attributes.file());
      await user.setAvatar(file);

      await user.destroy();

      const deleted = await db.File.findByPk(file.id);

      expect(deleted).toBe(null);
      expect(fileStorage.remove).toBeCalled();
    });
  });
});
