import faker from "@faker-js/faker";

const attributes = (fields = {}) => ({
  name: faker.word.adverb(),
  ...fields,
});

const define = {
  modelName: "Role",
  attributes,
};

export default define;
