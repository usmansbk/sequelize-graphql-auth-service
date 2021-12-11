import faker from "faker";

export const userAttributes = () => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(6),
  phoneNumber: faker.phone.phoneNumber(),
  locale: faker.address.countryCode(),
});
