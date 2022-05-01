import { Op } from "sequelize";
import dayjs from "~utils/dayjs";

export default {
  Query: {
    totalUserCount(_parent, _arg, { dataSources }) {
      return dataSources.users.count();
    },
    newUserCount(_parent, arg, { dataSources }) {
      const { since = dayjs.utc().startOf("day") } = arg || {};
      return dataSources.users.count({
        where: {
          createdAt: {
            [Op.gte]: since,
          },
        },
      });
    },
  },
};
