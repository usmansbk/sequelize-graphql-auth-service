import faker from "@faker-js/faker";

const attributes = (fields = {}) => ({
  key: faker.internet.domainName(),
  name: "fixture",
  bucket: faker.word.adverb(),
  size: 10000,
  mimeType: "png",
  ...fields,
});

const define = {
  modelName: "File",
  attributes,
};

export default define;
