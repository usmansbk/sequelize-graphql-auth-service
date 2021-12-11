import db from "~db/models";

const { User } = db.sequelize;

describe("User model", () => {
  test("2 + 2", () => {
    expect(2 + 2).toBe(4);
  });
});
