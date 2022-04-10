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

const create = async (name, { include, ...values } = {}) => {
  const modelInstance = await factories[name.toLowerCase()].create(values);
  if (include) {
    const { associations } = factories[name];
    if (!associations) {
      throw new Error(
        `[FactoryBot] No associations defined for "${name}" factory`
      );
    }
    Object.keys(include).forEach((alias) => {
      const factoryName = associations[alias];
      if (!factoryName) {
        throw new Error(
          `[FactoryBot] No "${factoryName} association defined in "${name}" factory`
        );
      }

      const { model } = factories[factoryName];
      const association = model.associations[alias];

      if (!association) {
        throw new Error(
          `[FactoryBot] No "${alias}" association defined in "${model.name} model"`
        );
      }

      const { values } = include[alias];
      console.log(Object.keys(association));
      console.log(values);
    });
  }
  return modelInstance;
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
