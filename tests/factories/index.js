import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import db from "~db/models";

const definitions = loadFilesSync(path.join(__dirname, "."), {
  ignoreIndex: true,
  extensions: ["js"],
});

const factories = {};

definitions.forEach(({ modelName, attributes, associations }) => {
  const model = db[modelName];

  factories[modelName.toLowerCase()] = {
    attributes: (values) => Object.assign(attributes(), values),
    create: (values) => model.create(Object.assign(attributes(), values)),
    build: (values) => model.build(Object.assign(attributes(), values)),
    truncate: () => model.destroy({ truncate: true }),
    model,
    associations,
  };
});

const create = async (name, { include, ...values } = {}) => {
  const newInstance = await factories[name.toLowerCase()].create(values);
  if (include) {
    const { associations, model } = factories[name];
    if (!associations) {
      throw new Error(
        `[FactoryBot] No associations defined for "${name}" factory`
      );
    }
    const aliases = Object.keys(include);
    for (let i = 0; i < aliases.length; i++) {
      const alias = aliases[i];
      const factoryName = associations[alias];
      if (!factoryName) {
        throw new Error(
          `[FactoryBot] No "${factoryName} association defined in "${name}" factory`
        );
      }

      const association = model.associations[alias];
      if (!association) {
        throw new Error(
          `[FactoryBot] No "${alias}" association defined in "${model.name} model"`
        );
      }

      const { accessors, isMultiAssociation } = association;
      const input = include[alias];
      let relationship;
      if (isMultiAssociation && Array.isArray(input)) {
        relationship = await Promise.all(
          input.map((i) => create(factoryName, i))
        );
      } else {
        const { _count, ...fields } = input;
        if (isMultiAssociation && _count) {
          relationship = await Promise.all(
            new Array(_count).fill(fields).map((i) => create(factoryName, i))
          );
        } else {
          relationship = await create(factoryName, fields);
        }
      }
      await newInstance[accessors.set](relationship);
    }
  }
  return newInstance;
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
