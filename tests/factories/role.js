import faker from "@faker-js/faker";

const define = {
  modelName: "Role",
  attributes: () => ({
    name: faker.word.adverb(),
  }),
  associations: {
    members: "user",
    permissions: "permission",
  },
};

export default define;
