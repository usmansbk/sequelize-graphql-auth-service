import faker from "@faker-js/faker";

const user = (fields = {}) => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.unique(faker.internet.email),
  password: faker.internet.password(6),
  username: faker.internet.userName(),
  language: "en",
  ...fields,
});

const file = (fields = {}) => ({
  key: faker.internet.domainName(),
  name: "fixture",
  bucket: faker.word.adverb(),
  size: 10000,
  mimeType: "png",
  ...fields,
});

export default {
  user,
  file,
  faker,
};
