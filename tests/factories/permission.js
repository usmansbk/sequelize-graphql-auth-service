import faker from "@faker-js/faker";

const define = {
  modelName: "Permission",
  attributes: () => ({
    name: faker.unique(faker.random.word),
    resource: faker.word.noun(),
    action: faker.word.verb(),
  }),
  associations: {
    roles: "role",
  },
};

export default define;
