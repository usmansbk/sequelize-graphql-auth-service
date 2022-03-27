import { Op } from "sequelize";
import btoa from "btoa";
import atob from "atob";
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
    async users(_parent, { page }, { dataSources }) {
      const {
        limit,
        order: { field = "createdAt", sort = "ASC" } = {},
        cursor,
      } = page || {};

      const paginationQuery = {};

      if (cursor) {
        const { value, createdAt } = JSON.parse(atob(cursor));
        const operation = sort === "ASC" ? Op.gte : Op.lte;
        paginationQuery[Op.and] = [
          {
            [field]: {
              [operation]: value,
            },
          },
          {
            [Op.or]: [
              {
                [field]: {
                  [operation]: value,
                },
              },
              {
                createdAt: {
                  [operation]: createdAt,
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
        nextCursor = btoa(
          JSON.stringify({ value: next[field], createdAt: next.createdAt })
        );
      }

      return {
        items: rows.slice(0, limit),
        totalCount: count,
        nextCursor,
      };
    },
  },
};
