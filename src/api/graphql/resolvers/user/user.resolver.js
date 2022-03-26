import { Op } from "sequelize";
import { Fail, Success } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";

export default {
  User: {
    picture(parent) {
      return parent.avatar;
    },
    isOwner(parent, _args, { tokenInfo }) {
      return parent.id === tokenInfo?.sub;
    },
  },
  Query: {
    async me(_parent, _args, { t, currentUser }) {
      try {
        return Success({ user: currentUser });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
          });
        }
        throw e;
      }
    },
    async users(_parent, { page }, { dataSources, db }) {
      const {
        limit,
        order = "createdAt",
        direction = "ASC",
        cursor,
      } = page || {};

      const query = {};

      if (cursor) {
        query.cursor = {
          [Op.gt]: cursor,
        };
      }

      const items = await dataSources.users.findAll({
        limit,
        order: [[order, direction]],
        where: { ...query },
      });
      const totalCount = await db.User.count();

      return {
        items,
        totalCount,
      };
    },
  },
};
