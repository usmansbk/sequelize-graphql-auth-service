import { Op } from "sequelize";

const CONDITIONALS = {
  and: "and",
  or: "or",
  not: "not",
};

const buildComparison = (operation) => {
  const query = {};
  Object.keys(operation).forEach((operator) => {
    query[Op[operator]] = operation[operator];
  });
  return query;
};

export const buildWhereQuery = (where) => {
  if (!where) {
    return undefined;
  }

  const query = {};
  Object.keys(where).forEach((attribute) => {
    const value = where[attribute];

    if (
      attribute === CONDITIONALS.and ||
      attribute === CONDITIONALS.or ||
      attribute === CONDITIONALS.not
    ) {
      query[Op[attribute]] = value.map(buildWhereQuery);
    } else {
      query[attribute] = buildComparison(value);
    }
  });

  return query;
};

export const buildIncludeQuery = (include) => {
  if (!include) {
    return undefined;
  }

  return Object.keys(include).map((association) => {
    const value = include[association];

    const query = {
      association,
    };

    if (value.where) {
      query.where = buildWhereQuery(value.where);
    }

    if (value.include) {
      query.include = buildIncludeQuery(value.include);
    }

    return query;
  });
};
