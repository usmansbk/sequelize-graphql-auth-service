import { faker } from "@faker-js/faker";

const define = {
  modelName: "Application",
  attributes: () => ({
    name: faker.internet.domainName(),
    description: "test application",
  }),
};

export default define;
