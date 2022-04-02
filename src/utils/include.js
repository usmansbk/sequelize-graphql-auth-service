import graphqlFields from "graphql-fields";
import {
  PERMISSIONS_ALIAS,
  ROLES_ALIAS,
  ROLE_MEMBERS_ALIAS,
} from "~constants/models";

const associations = {
  User: [ROLES_ALIAS],
  Role: [PERMISSIONS_ALIAS, ROLE_MEMBERS_ALIAS],
};

/**
 * This function takes the info: GraphQLResolveInfo object in general graphql arguments (parent, args, context, info) to eager-load sequelize relations.
 * The approach allows a better performance since you will only be using one resolver to retrieve all your request.
 * By doing so, it also eliminates the N + 1 issue.
 */
function buildIncludeQuery({ info, modelName, fieldName }) {
  if (!info) {
    return undefined;
  }

  const value = graphqlFields(info);
  const fields = fieldName ? value[fieldName] : value;

  const modelMap = associations[modelName];
  const include = [];

  modelMap.forEach((association) => {
    if (fields[association]) {
      include.push({ association });
    }
  });

  return include;
}

export default buildIncludeQuery;
