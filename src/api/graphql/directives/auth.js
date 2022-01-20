import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { AuthenticationError, ForbiddenError } from "apollo-server-core";
import { defaultFieldResolver } from "graphql";
import {
  AUTH_OWNER_STRATEGY,
  AUTH_ROLE_STRATEGY,
  AUTH_SCOPE_STRATEGY,
} from "~helpers/constants/auth";
import { UNAUTHENTICATED, UNAUTHORIZED } from "~helpers/constants/i18n";

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
          // check authentication
          const { tokenInfo, dataSources, sessionId } = context;
          const isLoggedIn = tokenInfo?.sid === sessionId;
          const user =
            isLoggedIn && (await dataSources.users.findByPk(tokenInfo.sub));

          if (!user) {
            throw new AuthenticationError(UNAUTHENTICATED);
          }

          // check authorization
          const { rules } = authDirective;
          if (rules) {
            const hasPermissions = rules.some((rule) => {
              const { allow, ownerField } = rule;
              switch (allow) {
                case AUTH_OWNER_STRATEGY:
                  return source[ownerField] === user.id;
                case AUTH_ROLE_STRATEGY:
                  return false; // TODO
                case AUTH_SCOPE_STRATEGY:
                  return false; // TODO
                default:
                  return false;
              }
            });
            if (!hasPermissions) {
              throw new ForbiddenError(UNAUTHORIZED);
            }
          }

          return resolve(source, args, context, info);
        };
        return newFieldConfig;
      }
      return fieldConfig;
    },
  });

export default authDirectiveTransformer;
