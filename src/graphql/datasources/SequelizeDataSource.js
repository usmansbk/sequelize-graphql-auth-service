import { DataSource } from "apollo-datasource";
import DataLoader from "dataloader";

/**
 * This class encapsulates the base fetching data from database using Sequelize.
 * The queries are deduplicated using dataloader.
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
    if (!id) return null;

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
