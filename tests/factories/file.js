import faker from "@faker-js/faker";

const define = {
  modelName: "File",
  attributes: () => ({
    key: faker.internet.domainName(),
    name: "fixture",
    bucket: faker.word.adverb(),
    size: 10000,
    mimeType: "png",
  }),
};

export default define;
