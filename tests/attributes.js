import faker from "faker";

export const userAttributes = (attr = {}) => {
  const defaults = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(6),
    phoneNumber: faker.phone.phoneNumber(),
    locale: faker.address.countryCode(),
  };

  return Object.assign({}, defaults, attr);
};
