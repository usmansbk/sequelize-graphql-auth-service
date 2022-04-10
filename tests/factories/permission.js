import faker from "@faker-js/faker";

const attributes = (fields = {}) => ({
  name: faker.word.adverb(),
  resource: faker.database.column(),
  action: faker.database.column(),
  ...fields,
});

const define = {
  modelName: "Permission",
  attributes,
};

export default define;
