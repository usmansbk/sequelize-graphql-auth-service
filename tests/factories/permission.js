import faker from "@faker-js/faker";

const define = {
  modelName: "Permission",
  attributes: () => ({
    scope: faker.unique(faker.name.firstName),
    description: "A short description",
  }),
  associations: {
    roles: "role",
  },
};

export default define;
