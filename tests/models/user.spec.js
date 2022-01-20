import {
  USER_EMAIL_UNAVAILABLE_ERROR,
  USER_FIRST_NAME_EMPTY_ERROR,
  USER_FIRST_NAME_REQUIRED_ERROR,
  USER_INVALID_EMAIL_ERROR,
  USER_INVALID_LOCALE_ERROR,
  USER_LAST_NAME_EMPTY_ERROR,
  USER_LAST_NAME_REQUIRED_ERROR,
  USER_PASSWORD_LEN_ERROR,
  USER_PHONE_NUMBER_UNAVAILABLE_ERROR,
  USER_PHONE_NUMBER_FORMAT_ERROR,
} from "~helpers/constants/i18n";
import UserFactory from "../factories/user";

describe("User model", () => {
  describe("validate", () => {
    let user, existingUser;

    beforeAll(async () => {
      existingUser = await UserFactory.create();
    });

    beforeEach(() => {
      user = UserFactory.build();
    });

    test("should not allow null `firstName`", async () => {
      user.firstName = null;
      await expect(user.validate(["firstName"])).rejects.toThrow(
        USER_FIRST_NAME_REQUIRED_ERROR
      );
    });

    test("should not allow empty `firstName`", async () => {
      user.firstName = " ";
      await expect(user.validate(["firstName"])).rejects.toThrow(
        USER_FIRST_NAME_EMPTY_ERROR
      );
    });

    test("should not allow null `lastName`", async () => {
      user.lastName = null;
      await expect(user.validate(["lastName"])).rejects.toThrow(
        USER_LAST_NAME_REQUIRED_ERROR
      );
    });

    test("should not allow empty `lastName`", async () => {
      user.lastName = " ";
      await expect(user.validate(["lastName"])).rejects.toThrow(
        USER_LAST_NAME_EMPTY_ERROR
      );
    });

    test("should not allow invalid `email`", async () => {
      user.email = "siuuuuu";
      await expect(user.validate(["email"])).rejects.toThrow(
        USER_INVALID_EMAIL_ERROR
      );
    });

    test("should not allow invalid `phoneNumber`", async () => {
      user.phoneNumber = " ";
      await expect(user.validate(["phoneNumber"])).rejects.toThrow(
        USER_PHONE_NUMBER_FORMAT_ERROR
      );
    });

    test("should have `password` length [6 - 24] characters long", async () => {
      user.password = "12345";
      await expect(user.validate(["password"])).rejects.toThrow(
        USER_PASSWORD_LEN_ERROR
      );
    });

    test("should not allow invalid `language`", async () => {
      user.language = "1234";
      await expect(user.validate(["language"])).rejects.toThrow(
        USER_INVALID_LOCALE_ERROR
      );
    });

    test("should have a `fullName`", () => {
      expect(user.fullName).toMatch(`${user.firstName} ${user.lastName}`);
    });

    test("should have unique `email`", async () => {
      await expect(
        UserFactory.create({ email: existingUser.email })
      ).rejects.toThrow(USER_EMAIL_UNAVAILABLE_ERROR);
    });

    test("should have unique `phoneNumber`", async () => {
      await expect(
        UserFactory.create({ phoneNumber: existingUser.phoneNumber })
      ).rejects.toThrow(USER_PHONE_NUMBER_UNAVAILABLE_ERROR);
    });
  });

  describe("#checkPassword", () => {
    let user;

    beforeAll(async () => {
      user = await UserFactory.create({ password: "password" });
    });

    test("should match correct password", async () => {
      await expect(user.checkPassword("password")).resolves.toBe(true);
    });

    test("should not match wrong password", async () => {
      await expect(user.checkPassword("wrong-password")).resolves.toBe(false);
    });
  });
});
