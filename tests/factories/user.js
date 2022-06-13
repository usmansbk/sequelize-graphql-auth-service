import { faker } from "@faker-js/faker";

const define = {
  modelName: "User",
  attributes: () => ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.unique(faker.internet.email),
    password: faker.internet.password(6),
    phoneNumber: faker.phone.phoneNumber("+234##########"),
    username: faker.unique(faker.internet.userName),
    locale: "en",
  }),
  associations: {
    avatar: "file",
    roles: "role",
  },
};

export default define;
