import db from "~db/models";
import faker from "faker";

const { User, sequelize } = db;

const mockUser = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(6),
  phoneNumber: faker.phone.phoneNumber(),
  locale: faker.address.countryCode(),
};

describe("User model", () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    User.drop();
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
  });
});
