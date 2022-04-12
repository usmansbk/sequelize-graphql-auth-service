import FactoryBot from "tests/factories";

describe("User", () => {
  beforeEach(async () => {
    await FactoryBot.truncate();
  });

  afterAll(() => jest.useRealTimers());

  describe("#checkPassword", () => {
    test("should check if a user password is correct and encrypted", async () => {
      const password = FactoryBot.attributesFor("user").password;
      const user = await FactoryBot.create("user", {
        password,
      });

      const check = await user.checkPassword(password);

      expect(check).toBe(true);
      expect(password).not.toBe(user.password);
    });
  });

  describe("#associations", () => {
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

  describe("#hooks", () => {
    test("should set passwordResetAt when password change", async () => {
      jest.useFakeTimers();
      const user = await FactoryBot.create("user");

      await user.update({
        password: FactoryBot.attributesFor("user").password,
      });
      await user.reload();

      expect(user.passwordResetAt).toEqual(new Date());
    });
  });
});
