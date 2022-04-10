import faker from "@faker-js/faker";

const define = {
  modelName: "Role",
  attributes: () => ({
    name: faker.word.adverb(),
  }),
};

export default define;
