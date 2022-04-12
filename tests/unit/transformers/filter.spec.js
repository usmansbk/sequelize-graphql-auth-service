import { Op } from "sequelize";
import { buildIncludeQuery } from "~utils/transformers/filter";

describe("buildIncludeQuery", () => {
  test("nested where clause", () => {
    const include = { roles: { where: { id: { eq: "1" } } } };

    const query = buildIncludeQuery(include);

    expect(query).toEqual([
      {
        association: "roles",
        where: {
          id: {
            [Op.eq]: "1",
          },
        },
      },
    ]);
  });
});
