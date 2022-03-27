import btoa from "btoa";
import atob from "atob";
import { Op } from "sequelize";

export const getNextCursor = (data = {}) => btoa(JSON.stringify(data));

const parseCursor = (cursor) => JSON.parse(atob(cursor));

/**
 * Based on "MySQL cursor based pagination with multiple columns"
 * https://stackoverflow.com/questions/38017054/mysql-cursor-based-pagination-with-multiple-columns/38017813
 */
export const getPaginationQuery = (order, cursor) => {
  const { field, sort } = order;
  const last = parseCursor(cursor);

  const operation = sort === "ASC" ? Op.gt : Op.lt;
  const paginationQuery = {
    [field]: {
      [operation]: last[field],
    },
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
  };

  return paginationQuery;
};
