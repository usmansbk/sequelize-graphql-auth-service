import faker from "@faker-js/faker";

const user = (fields = {}) => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.unique(faker.internet.email),
  password: faker.internet.password(6),
  ...fields,
});

export default {
  user,
};
