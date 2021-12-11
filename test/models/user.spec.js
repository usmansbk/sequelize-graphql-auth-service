import db from "~db/models";
import mockUser from "../mocks/user";

const { User, sequelize } = db;

describe("User model", () => {
  beforeAll(async () => {
    await User.sync({ force: true });
  });

  afterAll(async () => {
    await User.drop();
    await sequelize.close();
  });

  describe("validate", () => {
    let user;

    beforeEach(() => {
      user = User.build(mockUser);
    });

    test("should not allow null `firstName`", async () => {
      user.firstName = null;
      await expect(user.validate(["firstName"])).rejects.toThrow(
        "nameRequired"
      );
    });

    test("should not allow empty `firstName`", async () => {
      user.firstName = " ";
      await expect(user.validate(["firstName"])).rejects.toThrow("emptyName");
    });

    test("should not allow null `lastName`", async () => {
      user.lastName = null;
      await expect(user.validate(["lastName"])).rejects.toThrow("nameRequired");
    });

    test("should not allow empty `lastName`", async () => {
      user.lastName = " ";
      await expect(user.validate(["lastName"])).rejects.toThrow("emptyName");
    });

    test("should not allow invalid `email`", async () => {
      user.email = "siuuuuu";
      await expect(user.validate(["email"])).rejects.toThrow("invalidEmail");
    });

    test("should not allow invalid `phoneNumber`", async () => {
      user.phoneNumber = " ";
      await expect(user.validate(["phoneNumber"])).rejects.toThrow(
        "invalidPhoneNumber"
      );
    });

    test("should not allow invalid `locale`", async () => {
      user.locale = "1234";
      await expect(user.validate(["phoneNumber"])).rejects.toThrow(
        "invalidLocale"
      );
    });

    test("should have a `fullName`", () => {
      expect(user.fullName).toMatch(`${user.firstName} ${user.lastName}`);
    });
  });

  describe("#checkPassword", () => {
    let user;

    beforeAll(async () => {
      user = await User.create(mockUser);
    });

    test("should match correct password", async () => {
      await expect(user.checkPassword(mockUser.password)).resolves.toBe(true);
    });

    test("should not match wrong password", async () => {
      await expect(user.checkPassword("wrong-password")).resolves.toBe(false);
    });
  });
});
