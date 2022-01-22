import faker from "@faker-js/faker";

export const userAttributes = (fields = {}) => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(6),
  ...fields,
});
