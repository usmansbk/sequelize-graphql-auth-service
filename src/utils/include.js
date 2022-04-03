import graphqlFields from "graphql-fields";

const excludeFields = ["avatar", "members", "roles"];

/**
 * This function takes the info: GraphQLResolveInfo object in general graphql arguments (parent, args, context, info) to eager-load sequelize relations.
 * The approach allows a better performance since you will only be using one resolver to retrieve all your request.
 * By doing so, it also eliminates the N + 1 issue.
 */
function buildIncludeQuery(fields) {
  let includeQuery;

  Object.keys(fields).forEach((key) => {
    if (!excludeFields.includes(key) && Object.keys(fields[key]).length) {
      includeQuery = [
        { association: key, include: buildIncludeQuery(fields[key]) },
      ];
    }
  });

  return includeQuery;
}

function include({ info, fieldName }) {
  if (!info) {
    return undefined;
  }

  const value = graphqlFields(info);
  const fields = fieldName ? value[fieldName] : value;

  return buildIncludeQuery(fields);
}

export default include;
