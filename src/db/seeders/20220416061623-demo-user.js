import { faker } from "@faker-js/faker";

export function up(queryInterface) {
  return queryInterface.bulkInsert(
    "Users",
    new Array(100).fill(0).map(() => ({
      id: faker.datatype.uuid(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.unique(faker.internet.email),
      username: faker.unique(faker.internet.userName),
      password: faker.internet.password(8),
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );
}
export function down(queryInterface) {
  return queryInterface.bulkDelete("Users", null, {});
}
