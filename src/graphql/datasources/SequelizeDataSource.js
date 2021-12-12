import { DataSource } from "apollo-datasource";
import DataLoader from "dataloader";

/**
 * The SequelizeDataSource abstract class helps you query data from an SQL database. Your server
 * defines a separate subclass of SequelizeDataSource for each Model it communicates with.
 * It is configured with a Dataloader to prevent the N+1 problem (loading the same object multiple times during a single request).
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

  findOneById(id) {
    return this.loader.load(id);
  }

  findManyByIds(ids = []) {
    return this.loader.loadMany(ids);
  }

  async findByFields(where) {
    const item = await this.model.findOne({
      where,
    });
    this.prime(item);
    return item;
  }

  async findManyByFields(where) {
    const items = await this.model.findAll({ where });
    this.primeMany(items);

    return items;
  }

  prime(item) {
    this.loader.prime(item.id, item);
  }

  primeMany(items) {
    items.forEach((item) => this.prime(item));
  }
}
