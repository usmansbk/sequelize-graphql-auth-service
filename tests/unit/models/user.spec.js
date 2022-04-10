import fileStorage from "~utils/fileStorage";
import FactoryBot from "tests/factories";

fileStorage.remove = jest.fn().mockReturnValueOnce(Promise.resolve());

describe("User", () => {
  describe("association", () => {
    beforeEach(async () => {
      await FactoryBot.truncate();
    });

    test("should remove avatar on destroy", async () => {
      const user = await FactoryBot.create("user", {
        include: {
          avatar: {},
        },
      });
      const file = user.avatar;

      await user.destroy();
      const deletedFile = await FactoryBot.db("file").findByPk(file.id);

      expect(deletedFile).toBe(null);
      expect(fileStorage.remove).toBeCalled();
    });

    test("should not cascade role on destroy", async () => {
      const user = await FactoryBot.create("user", {
        include: {
          roles: {
            _count: 4,
          },
        },
      });

      await user.destroy();
      const count = await FactoryBot.db("role").count();

      expect(count).toBe(4);
    });
  });
});
