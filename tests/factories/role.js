import faker from "@faker-js/faker";

const define = {
  modelName: "Role",
  attributes: () => ({
    name: faker.unique(faker.name.jobType),
  }),
  associations: {
    members: "user",
    permissions: "permission",
  },
};

export default define;
