import FactoryBot from "tests/factories";
import getUser from "~utils/getUser";

describe("getUser", () => {
  beforeEach(async () => {
    await FactoryBot.truncate();
  });

  test("should return a User instance from database", async () => {
    const user = await FactoryBot.create("user", {
      include: {
        roles: {
          include: {
            permissions: {
              _count: 3,
            },
          },
        },
      },
    });

    const instance = await getUser(user.id);

    expect(instance).toBeInstanceOf(FactoryBot.db("user"));
  });

  test("should return a User instance from cache", async () => {
    const user = await FactoryBot.create("user", {
      include: {
        avatar: {},
        roles: {
          include: {
            permissions: {
              _count: 3,
            },
          },
        },
      },
    });

    await getUser(user.id);
    const instance = await getUser(user.id);
    const avatar = await instance.getAvatar();

    expect(instance).toBeInstanceOf(FactoryBot.db("user"));
    expect(instance.roles).toHaveLength(1);
    expect(instance.roles[0].permissions).toHaveLength(3);
    expect(avatar.id).toBe(user.avatar.id);
  });
});
