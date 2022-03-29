/**
 * Based on "MySQL cursor based pagination with multiple columns"
 * https://stackoverflow.com/questions/38017054/mysql-cursor-based-pagination-with-multiple-columns/38017813
 */

import btoa from "btoa";
import atob from "atob";
import { Op } from "sequelize";

export const createCursor = (order, next) =>
  btoa(JSON.stringify(order.map(({ field }) => next[field])));

export const parseCursor = (cursor) => JSON.parse(atob(cursor));

const DEFAULT_DIRECTION = "ASC";
const TIMESTAMP_FIELD = "createdAt";
const UNIQUE_FIELDS = ["id", "email", "username", TIMESTAMP_FIELD];

export const ensureDeterministicOrder = (order) => {
  const hasUniqueField = order.find(({ field }) =>
    UNIQUE_FIELDS.includes(field)
  );

  if (hasUniqueField) {
    return order;
  }
  return [...order, { field: TIMESTAMP_FIELD, sort: DEFAULT_DIRECTION }];
};

const buildPaginationQuery = (order = [], last = []) => {
  const [{ field, sort }] = order;
  const operation = sort === DEFAULT_DIRECTION ? Op.gt : Op.lt;
  const [value] = last;

  if (order.length === 1) {
    return {
      [field]: {
        [operation]: value,
      },
    };
  }
  return {
    [Op.or]: [
      {
        [field]: {
          [operation]: value,
        },
      },
      {
        [field]: value,
        ...buildPaginationQuery(order.slice(1), last.slice(1)),
      },
    ],
  };
};

export const getPaginationQuery = (order, cursor) => {
  const last = parseCursor(cursor);

  if (order?.length !== last?.length) {
    return null;
  }
  return buildPaginationQuery(order, last);
};
