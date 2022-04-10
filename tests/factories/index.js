import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import db from "~db/models";

const definitions = loadFilesSync(path.join(__dirname, "."), {
  ignoreIndex: true,
  extensions: ["js"],
});

const factories = {};

definitions.forEach(({ modelName, attributes }) => {
  const model = db[modelName];

  factories[modelName.toLowerCase()] = {
    attributes: (values) => Object.assign(attributes(), values),
    create: (values) => model.create(Object.assign(attributes(), values)),
    build: (values) => model.build(Object.assign(attributes(), values)),
    truncate: () => model.destroy({ truncate: true }),
    model,
  };
});

const create = async (name, { associations, ...values } = {}) => {
  const model = await factories[name.toLowerCase()].create(values);
  return model;
};

const FactoryBot = {
  create,
  attributesFor: (name, values) =>
    factories[name.toLowerCase()].attributes(values),
  build: (name, values) => factories[name.toLowerCase()].build(values),
  db: (name) => factories[name.toLowerCase()].model,
  truncate: () =>
    Promise.all(Object.values(factories).map((factory) => factory.truncate())),
};

export default FactoryBot;
