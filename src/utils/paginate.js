/**
 * Based on "MySQL cursor based pagination with multiple columns"
 * https://stackoverflow.com/questions/38017054/mysql-cursor-based-pagination-with-multiple-columns/38017813
 */

import btoa from "btoa";
import atob from "atob";
import { Op } from "sequelize";

export const getNextCursor = (order, next) =>
  btoa(JSON.stringify(order.map(({ field }) => next[field])));

export const parseCursor = (cursor) => JSON.parse(atob(cursor));

const TIMESTAMP_FIELD = "createdAt";
const UNIQUE_FIELDS = ["id", "email", "username", TIMESTAMP_FIELD];

export const ensureDeterministicOrder = (order) => {
  const hasUniqueField = order.find(({ field }) =>
    UNIQUE_FIELDS.includes(field)
  );

  if (hasUniqueField) {
    return order;
  }
  return [...order, { field: TIMESTAMP_FIELD, sort: "ASC" }];
};

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
