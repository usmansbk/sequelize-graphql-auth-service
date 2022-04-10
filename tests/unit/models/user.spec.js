import fileStorage from "~utils/fileStorage";
import FactoryBot from "tests/factories";

fileStorage.remove = jest.fn().mockReturnValueOnce(Promise.resolve());

describe("User", () => {
  describe("association", () => {
    test("should remove avatar on destroy", async () => {
      const user = await FactoryBot.create("user", {
        include: {
          avatar: {},
        },
      });
      const file = await user.getAvatar();

      await user.destroy();
      const deletedFile = await FactoryBot.db("file").findByPk(file.id);

      expect(deletedFile).toBe(null);
      expect(fileStorage.remove).toBeCalled();
    });
  });
});
