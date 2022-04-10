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
    attributes,
    create: (values) => model.create(attributes(values)),
    build: (values) => model.build(attributes(values)),
    truncate: () => model.destroy({ truncate: true }),
    model,
  };
});

const FactoryBot = {
  attributesFor: (name, values) =>
    factories[name.toLowerCase()].attributes(values),
  create: (name, values) => factories[name.toLowerCase()].create(values),
  build: (name, values) => factories[name.toLowerCase()].build(values),
  db: (name) => factories[name.toLowerCase()].model,
  truncate: () =>
    Promise.all(Object.values(factories).map((factory) => factory.truncate())),
};

export default FactoryBot;
