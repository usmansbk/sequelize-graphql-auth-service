import faker from "@faker-js/faker";
import db from "~db/models";

const attributes = (fields = {}) => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.unique(faker.internet.email),
  password: faker.internet.password(6),
  phoneNumber: faker.phone.phoneNumber("+234##########"),
  username: faker.internet.userName(),
  locale: "en",
  ...fields,
});

const create = (values) => db.User.create(attributes(values));

const build = (values) => db.File.build(attributes(values));

const UserFactory = {
  attributes,
  create,
  build,
  model: db.User,
};

export default UserFactory;
