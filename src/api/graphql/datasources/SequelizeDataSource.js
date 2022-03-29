/* eslint-disable class-methods-use-this */
import {
  EmptyResultError,
  UniqueConstraintError,
  ValidationError,
} from "sequelize";
import { DataSource } from "apollo-datasource";
import DataLoader from "dataloader";
import formatErrors from "~utils/formatErrors";
import FieldErrors from "~utils/errors/FieldErrors";
import QueryError from "~utils/errors/QueryError";
import {
  ensureDeterministicOrder,
  getNextCursor,
  getPaginationQuery,
} from "~utils/paginate";
import { FIELD_ERRORS, ITEM_NOT_FOUND } from "~constants/i18n";

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

  onCreate() {}

  onUpdate() {}

  onDestroy() {}

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

  async findOne(query) {
    const item = await this.model.findOne(query);
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

  async findOrCreate(queryOptions) {
    try {
      const [item, created] = await this.model.findOrCreate(queryOptions);
      if (item) {
        this.prime(item);
      }

      if (created) {
        const newImage = item.toJSON();
        this.onCreate({ newImage });
      }

      return [item, created];
    } catch (e) {
      return this.onError(e);
    }
  }

  async create(fields) {
    try {
      const item = await this.model.create(fields);
      const newImage = item.toJSON();
      this.prime(item);
      this.onCreate(newImage);

      return item;
    } catch (e) {
      return this.onError(e);
    }
  }

  async update(id, fields) {
    try {
      const item = await this.findByPk(id);

      if (!item) {
        throw EmptyResultError();
      }

      const oldImage = item.toJSON();

      const newItem = await item.update(fields);
      const newImage = newItem.toJSON();

      this.prime(newItem);
      this.onUpdate({ oldImage, newImage });

      return newItem;
    } catch (e) {
      return this.onError(e);
    }
  }

  /**
   * Delete is idemponent and shouldn't throw an error if item does not exist
   */
  async destroy(id) {
    const item = await this.findByPk(id);
    if (item) {
      const oldImage = item.toJSON();
      await item.destroy();
      this.onDestroy({ oldImage });
    }
  }

  async paginate(page) {
    const { limit, order, cursor } = page || {};

    const determisticOrder = ensureDeterministicOrder(order || []);
    let paginationQuery = {};

    if (cursor) {
      paginationQuery = getPaginationQuery(determisticOrder, cursor);
    }

    const { rows, count } = await this.findAndCountAll({
      limit: limit + 1,
      order: determisticOrder.map(({ field, sort }) => [field, sort]),
      where: { ...paginationQuery },
    });

    let nextCursor;
    const next = rows[limit - 1];
    if (next) {
      nextCursor = getNextCursor(determisticOrder, next);
    }

    return {
      items: rows.slice(0, limit),
      totalCount: count,
      pageInfo: {
        nextCursor,
        hasNextPage: count > limit,
      },
    };
  }
}
