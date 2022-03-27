import { Op } from "sequelize";
import { Fail, Success } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";
import { getNextCursor, parseCursor } from "~utils/paginate";

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
        order: { field = "createdAt", sort = "ASC" } = {},
        cursor,
      } = page || {};

      const paginationQuery = {};

      if (cursor) {
        const last = parseCursor(cursor);
        const operation = sort === "ASC" ? Op.gte : Op.lte;

        paginationQuery[Op.and] = [
          {
            [field]: {
              [operation]: last[field],
            },
          },
          {
            [Op.or]: [
              {
                [field]: {
                  [operation]: last[field],
                },
              },
              {
                createdAt: {
                  [operation]: last.createdAt,
                },
              },
            ],
          },
        ];
      }

      const { rows, count } = await dataSources.users.findAndCountAll({
        limit: limit + 1,
        order: [
          [field, sort],
          ["createdAt", sort],
        ],
        where: { ...paginationQuery },
      });

      let nextCursor;
      const next = rows[limit];
      if (next) {
        nextCursor = getNextCursor({
          [field]: next[field],
          createdAt: next.createdAt,
        });
      }

      return {
        items: rows.slice(0, limit),
        totalCount: count,
        nextCursor,
      };
    },
  },
};
