import faker from "@faker-js/faker";

const define = {
  modelName: "Permission",
  attributes: () => ({
    name: faker.unique(faker.random.word),
    resource: "permissions",
    action: "read",
  }),
  associations: {
    roles: "role",
  },
};

export default define;
