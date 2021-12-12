import { DataSource } from "apollo-datasource";
import DataLoader from "dataloader";

/**
 * The SequelizeDataSource abstract class helps you query data from an SQL database. Your server
 * defines a separate subclass of SequelizeDataSource for each Model it communicates with.
 * It is configured with a Dataloader to prevent the N+1 problem (loading the same object multiple times during a single request).
 *
 * The onCreate, onUpdate, and onDestroy hooks can be overwritten in the child classes.
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

  async onCreate(_newImage) {
    // Override in child class
  }

  async onUpdate(_oldImage, _newImage) {
    // Override in child class
  }

  async onDestroy(_oldImage) {
    // Override in child class
  }

  async prime(item) {
    this.loader.prime(item.id, item);
  }

  primeMany(items) {
    items.forEach((item) => this.prime(item));
  }

  findByPk(id) {
    return this.loader.load(id);
  }

  findManyByPk(ids = []) {
    return this.loader.loadMany(ids);
  }

  async findOne(query) {
    const item = await this.model.findOne(query);
    this.prime(item);
    return item;
  }

  async findAll(query) {
    const items = await this.model.findAll(query);
    this.primeMany(items);

    return items;
  }

  async create(fields) {
    const item = await this.model.create(fields);
    const newImage = item.toJSON();
    this.prime(item);
    this.onCreate(newImage);

    return item;
  }

  async update(fields) {
    const item = await this.findOneById(fields.id);
    const oldImage = item.toJSON();

    const newItem = await item.update(fields);
    const newImage = newItem.toJSON();

    this.prime(newItem);
    this.onUpdate(oldImage, newImage);

    return newItem;
  }

  async destroy(id) {
    const item = await this.findOneById(id);
    const oldImage = item.toJSON();
    await item.destroy();
    this.onDestroy(oldImage);
  }
}
