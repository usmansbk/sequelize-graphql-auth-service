import faker from "@faker-js/faker";

const define = {
  modelName: "File",
  attributes: () => ({
    key: faker.datatype.uuid(),
    name: faker.system.commonFileName(),
    bucket: faker.system.directoryPath(),
    size: 10000,
    mimeType: faker.system.mimeType(),
  }),
};

export default define;
