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
  create: (name, values) => factories[name].create(values),
  build: (name, values) => factories[name].build(values),
  model: (name) => factories[name].model,
  truncate: () =>
    Object.values(factories).forEach((factory) => factory.truncate()),
};

export default FactoryBot;
