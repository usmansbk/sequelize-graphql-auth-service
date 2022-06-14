import {
  EmptyResultError,
  Op,
  UniqueConstraintError,
  ValidationError,
} from "sequelize";
import { DataSource } from "apollo-datasource";
import DataLoader from "dataloader";
import deepmerge from "deepmerge";
import formatErrors from "~utils/formatErrors";
import FieldErrors from "~utils/errors/FieldErrors";
import QueryError from "~utils/errors/QueryError";
import {
  ensureDeterministicOrder,
  createCursor,
  parseCursor,
  reverseOrder,
  buildPaginationQuery,
  normalizeOrder,
} from "~utils/transformers/paginate";
import { buildWhereQuery, buildIncludeQuery } from "~utils/transformers/filter";
import { buildEagerLoadingQuery } from "~utils/transformers/eagerLoader";
import { FIELD_ERRORS, ITEM_NOT_FOUND } from "~helpers/constants/responseCodes";

/**
 * The SequelizeDataSource abstract class helps you query data from an SQL database. Your server
 * defines a separate subclass of SequelizeDataSource for each Model it communicates with.
 * It is configured with a Dataloader to prevent the N+1 problem (loading the same object multiple times during a single request).
 *
 * The onCreate, onUpdate, and onDestroy hooks can be overwritten in the child classes.
 *
 * Subclasses with catch exceptions they can handle and rethrow unknown errors
 */
export default class SequelizeDataSource extends DataSource {
  constructor(model) {
    super();
    this.model = model;
    this.loader = new DataLoader(async (ids) => {
      const result = await this.model.findAll({
        where: {
          id: ids,
        },
      });

      const map = {};
      result.forEach((elem) => {
        map[elem.id] = elem;
      });

      return ids.map((id) => map[id]);
    });
  }

  initialize({ context } = {}) {
    this.context = context;
  }

  onCreate({ newItem }) {
    this.prime(newItem);
  }

  onUpdate({ newItem }) {
    this.prime(newItem);
  }

  onDestroy({ oldImage }) {
    this.loader.clear(oldImage.id);
  }

  onError(e) {
    if (e instanceof ValidationError || e instanceof UniqueConstraintError) {
      throw new FieldErrors(
        FIELD_ERRORS,
        formatErrors(e.errors, this.context.t),
        e
      );
    } else if (e instanceof EmptyResultError) {
      throw new QueryError(ITEM_NOT_FOUND, e);
    } else {
      throw e;
    }
  }

  async prime(item) {
    this.loader.prime(item.id, item);
  }

  primeMany(items) {
    items.forEach((item) => this.prime(item));
  }

  findByPk(id) {
    if (!id) {
      return null;
    }

    return this.loader.load(id);
  }

  findManyByPk(ids = []) {
    return this.loader.loadMany(ids);
  }

  async findOne({ path, info, skip, ...query }) {
    const item = await this.model.findOne({
      include: info
        ? buildEagerLoadingQuery({
            info,
            path,
            skip,
            model: this.model,
          })
        : undefined,
      ...query,
    });
    if (item) {
      this.prime(item);
    }

    return item;
  }

  async findAll(query) {
    const items = await this.model.findAll(query);
    this.primeMany(items);

    return items;
  }

  async findAndCountAll(query) {
    const { count, rows } = await this.model.findAndCountAll(query);
    this.primeMany(rows);

    return { count, rows };
  }

  async findOrCreate(options) {
    try {
      const [newItem, created] = await this.model.findOrCreate(options);

      if (created) {
        this.onCreate({ newItem });
      } else {
        this.prime(newItem);
      }

      return [newItem, created];
    } catch (e) {
      return this.onError(e);
    }
  }

  count(options) {
    return this.model.count(options);
  }

  async create(values, options) {
    try {
      const newItem = await this.model.create(values, options);
      this.onCreate({ newItem });

      return newItem;
    } catch (e) {
      return this.onError(e);
    }
  }

  async createMany(records, options = {}) {
    try {
      const models = await this.model.bulkCreate(records, {
        ...options,
        validate: true,
        returning: true,
      });

      this.primeMany(models);

      return models;
    } catch (e) {
      return this.onError(e);
    }
  }

  async update(id, values) {
    try {
      const item = await this.findByPk(id);

      if (!item) {
        throw EmptyResultError();
      }

      const oldImage = item.toJSON();

      const newItem = await item.update(values);

      this.onUpdate({ newItem, oldImage });

      return newItem;
    } catch (e) {
      return this.onError(e);
    }
  }

  async updateMany(values, options = {}) {
    try {
      const [, models] = await this.model.update(values, {
        validate: true,
        individualHooks: true,
        returning: true,
        ...options,
      });

      this.primeMany(models);
      return models;
    } catch (e) {
      return this.onError(e);
    }
  }

  /**
   * Delete is idemponent and shouldn't throw an error if item does not exist
   */
  async destroy(id) {
    const item = await this.model.findByPk(id);
    if (item) {
      const oldImage = item.toJSON();
      await item.destroy();
      this.onDestroy({ oldImage });
    }
    return id;
  }

  async destroyMany(ids) {
    try {
      await this.model.destroy({
        where: {
          id: ids,
        },
        individualHooks: true,
      });
      return ids;
    } catch (e) {
      return this.onError(e);
    }
  }

  async paginate({ page, filter, info, skip, ...options }) {
    const { limit, order: orderArg, after, before } = page || {};

    let order = normalizeOrder(ensureDeterministicOrder(orderArg || []));

    order = before ? reverseOrder(order) : order;

    let cursor = null;

    if (before) {
      cursor = parseCursor(before);
    } else if (after) {
      cursor = parseCursor(after);
    }

    const paginationQuery = cursor && buildPaginationQuery(order, cursor);
    const where = filter?.where && buildWhereQuery(filter.where);
    const includeFilter = filter?.include
      ? buildIncludeQuery(filter.include)
      : [];
    const includeAssociation = info
      ? buildEagerLoadingQuery({
          info,
          skip,
          path: "items",
          model: this.model,
        })
      : [];
    const include = deepmerge(includeAssociation, includeFilter);

    const paginationWhere = paginationQuery
      ? { [Op.and]: [paginationQuery, where] }
      : where;

    const [rows, count, totalCount] = await Promise.all([
      this.findAll({
        limit,
        order,
        include,
        where: paginationWhere,
        ...options,
      }),
      this.model.count({ where: paginationWhere, include, ...options }),
      this.model.count({ where, include, ...options }),
    ]);

    if (before) {
      rows.reverse();
    }

    const end = rows[limit - 1];
    const endCursor = end && createCursor(order, end);

    const start = rows[0];
    const startCursor = start && createCursor(order, start);

    const remaining = count - rows.length;

    return {
      items: rows,
      totalCount,
      pageInfo: {
        endCursor,
        startCursor,
        hasNextPage:
          (!before && remaining > 0) || (!!before && totalCount - count > 0),
        hasPreviousPage:
          (!!before && remaining > 0) || (!before && totalCount - count > 0),
      },
    };
  }
}
