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
    async users(_parent, { page }, { dataSources }) {
      const {
        limit,
        order = { field: "createdAt", sort: "ASC" },
        cursor,
      } = page || {};

      let paginationQuery = {};

      if (cursor) {
        paginationQuery = getPaginationQuery(order, cursor);
      }
      const { field, sort } = order;
      const { rows, count } = await dataSources.users.findAndCountAll({
        limit: limit + 1,
        order: [
          [field, sort],
          ["createdAt", sort],
        ],
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
          hasNextPage: rows.length > limit,
        },
      };
    },
  },
};
