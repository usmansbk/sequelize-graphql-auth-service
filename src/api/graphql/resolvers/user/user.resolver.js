import { Fail, Success } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";
import { getNextCursor, getPaginationQuery } from "~utils/paginate";

export default {
  User: {
    picture(parent) {
      return parent.avatar;
    },
    isOwner(parent, _args, { tokenInfo }) {
      return parent.id === tokenInfo?.sub;
    },
    roles(parent) {
      return parent.getRoles();
    },
  },
  Query: {
    async me(_parent, _args, { t, currentUser, dataSources }) {
      try {
        const user = await dataSources.users.findByPk(currentUser.id); // get updated user
        return Success({ user });
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
    async users(_parent, { page }, { dataSources }) {
      const { limit, order = [], cursor } = page || {};

      let paginationQuery = {};

      if (cursor) {
        paginationQuery = getPaginationQuery(order, cursor);
      }
      const { rows, count } = await dataSources.users.findAndCountAll({
        limit: limit + 1,
        order: order.map(({ field, sort }) => [field, sort]),
        where: { ...paginationQuery },
      });

      let nextCursor;
      const next = rows[limit - 1];
      if (next) {
        nextCursor = getNextCursor(order, next);
      }

      return {
        items: rows.slice(0, limit),
        totalCount: count,
        pageInfo: {
          nextCursor,
          hasNextPage: count > limit,
        },
      };
    },
  },
};
