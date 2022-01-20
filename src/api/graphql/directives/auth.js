import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { AuthenticationError, ForbiddenError } from "apollo-server-core";
import { defaultFieldResolver } from "graphql";
import {
  AUTH_OWNER_STRATEGY,
  AUTH_ROLE_STRATEGY,
  AUTH_SCOPE_STRATEGY,
} from "~helpers/constants/auth";
import { UNAUTHENTICATED, UNAUTHORIZED } from "~helpers/constants/i18n";

const authDirectiveTransformer = (schema, directiveName) => {
  const typeDirectiveArgumentMaps = {};

  return mapSchema(schema, {
    [MapperKind.TYPE]: (type) => {
      const authDirective = getDirective(schema, type, directiveName)?.[0];
      if (authDirective) {
        typeDirectiveArgumentMaps[type.name] = authDirective;
      }
      return undefined;
    },
    [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
      const authDirective =
        getDirective(schema, fieldConfig, directiveName)?.[0] ??
        typeDirectiveArgumentMaps[typeName];
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
            const checks = rules.map((rule) => {
              const { allow, identityClaim } = rule;
              switch (allow) {
                case AUTH_OWNER_STRATEGY:
                  return new Promise((permit, reject) => {
                    if (source[identityClaim] !== user.id) {
                      reject();
                    }
                    permit();
                  });
                case AUTH_ROLE_STRATEGY:
                  return new Promise((_, reject) => {
                    reject();
                  }); // TODO
                case AUTH_SCOPE_STRATEGY:
                  return new Promise((_, reject) => {
                    reject();
                  }); // TODO
                default:
                  return new Promise((_, reject) => {
                    reject();
                  });
              }
            });

            try {
              await Promise.any(checks);
            } catch (e) {
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
};

export default authDirectiveTransformer;
