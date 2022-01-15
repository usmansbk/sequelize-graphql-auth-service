import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { AuthenticationError } from "apollo-server-core";
import { defaultFieldResolver } from "graphql";
import { UNAUTHENTICATED } from "~helpers/constants/i18n";

const authDirectiveTransformer = (schema, directiveName) =>
  mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0];
      if (authDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        const newFieldConfig = { ...fieldConfig };
        newFieldConfig.resolve = async (source, args, context, info) => {
          const { tokenInfo, dataSources } = context;
          const user =
            tokenInfo && (await dataSources.users.findByPk(tokenInfo.sub));

          if (!user) {
            throw new AuthenticationError(UNAUTHENTICATED);
          }

          // TODO: RBAC

          const result = await resolve(source, args, context, info);

          return result;
        };
        return newFieldConfig;
      }
      return fieldConfig;
    },
  });

export default authDirectiveTransformer;
