import faker from "@faker-js/faker";
import db from "~db/models";

const attributes = (fields = {}) => ({
  key: faker.internet.domainName(),
  name: "fixture",
  bucket: faker.word.adverb(),
  size: 10000,
  mimeType: "png",
  ...fields,
});

const create = (values) => db.File.create(attributes(values));

const build = (values) => db.File.build(attributes(values));

const FileFactory = {
  attributes,
  create,
  build,
};

export default FileFactory;
