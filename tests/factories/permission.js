import faker from "@faker-js/faker";

const define = {
  modelName: "Permission",
  attributes: () => ({
    scope: faker.unique(faker.random.word),
  }),
  associations: {
    roles: "role",
  },
};

export default define;
