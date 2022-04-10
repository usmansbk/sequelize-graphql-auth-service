import faker from "@faker-js/faker";

const define = {
  modelName: "Permission",
  attributes: () => ({
    name: faker.word.adverb(),
    resource: faker.database.column(),
    action: faker.database.column(),
  }),
  associations: {
    roles: "role",
  },
};

export default define;
