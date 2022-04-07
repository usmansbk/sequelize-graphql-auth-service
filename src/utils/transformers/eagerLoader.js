import { fieldsMap } from "graphql-fields-list";

const recursivelyBuildInclude = (fields, model) => {
  if (!fields) {
    return undefined;
  }

  const include = [];
  Object.keys(fields).forEach((field) => {
    const association = model?.associations[field];
    if (association) {
      include.push({
        association: field,
        include: fields?.[field]
          ? recursivelyBuildInclude(fields[field], association.target)
          : undefined,
      });
    }
  });

  return include;
};

export const buildEagerLoadingQuery = ({ info, path, model, skip }) => {
  if (!info) {
    return undefined;
  }

  const fields = fieldsMap(info, {
    path,
    skip: skip?.map((field) => (path ? `${path}.${field}` : field)),
  });

  return recursivelyBuildInclude(fields, model);
};

export default buildEagerLoadingQuery;
