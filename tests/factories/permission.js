import faker from "@faker-js/faker";
import db from "~db/models";

const attributes = (fields = {}) => ({
  name: faker.word.adverb(),
  resource: faker.database.column(),
  action: faker.database.column(),
  ...fields,
});

const create = (values) => db.Permission.create(attributes(values));

const build = (values) => db.Permission.build(attributes(values));

const PermissionFactory = {
  attributes,
  create,
  build,
  model: db.Permission,
};

export default PermissionFactory;
