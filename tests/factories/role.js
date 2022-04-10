import faker from "@faker-js/faker";
import db from "~db/models";

const attributes = (fields = {}) => ({
  name: faker.word.adverb(),
  ...fields,
});

const create = (values) => db.Role.create(attributes(values));

const build = (values) => db.Role.build(attributes(values));

const RoleFactory = {
  attributes,
  create,
  build,
  model: db.Role,
};

export default RoleFactory;
