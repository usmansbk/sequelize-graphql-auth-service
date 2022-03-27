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
        order: { field = "username", sort = "ASC" } = {},
        cursor,
      } = page || {};

      const paginationQuery = {};

      if (cursor) {
        const { value } = JSON.parse(atob(cursor));
        const operation = sort === "ASC" ? Op.gt : Op.lt;
        paginationQuery[Op.and] = [
          {
            [field]: {
              [operation]: value,
            },
          },
        ];
      }

      const { rows, count } = await dataSources.users.findAndCountAll({
        limit,
        order: [
          [field, sort],
          ["id", sort],
        ],
        where: { ...paginationQuery },
      });
      const last = rows[limit - 1];

      let nextCursor;
      if (last) {
        nextCursor = btoa(JSON.stringify({ value: last[field], id: last.id }));
      }

      return {
        items: rows,
        totalCount: count,
        nextCursor,
      };
    },
  },
};
