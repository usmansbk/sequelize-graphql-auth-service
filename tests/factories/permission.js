import { faker } from "@faker-js/faker";

const define = {
  modelName: "Permission",
  attributes: () => ({
    scope: `${faker.unique(faker.name.jobType)}:${faker.unique(
      faker.name.jobArea
    )}`.toLocaleLowerCase(),
    description: faker.name.jobDescriptor(),
  }),
  associations: {
    roles: "role",
  },
};

export default define;
