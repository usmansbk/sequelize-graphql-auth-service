import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { AuthenticationError, ForbiddenError } from "apollo-server-core";
import { defaultFieldResolver } from "graphql";
import { AUTH_OWNER_STRATEGY, AUTH_ROLE_STRATEGY } from "~constants/auth";
import { UNAUTHENTICATED, UNAUTHORIZED } from "~constants/i18n";

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
          const { tokenInfo, sessionId, currentUser } = context;
          const isLoggedIn = tokenInfo && tokenInfo.sid === sessionId;

          if (!(isLoggedIn && currentUser)) {
            throw new AuthenticationError(UNAUTHENTICATED);
          }

          // check authorization
          const { rules } = authDirective;
          if (rules) {
            const checks = rules.map((rule) => {
              const { allow, identityClaim, roles } = rule;
              switch (allow) {
                case AUTH_OWNER_STRATEGY:
                  return new Promise((permit, reject) => {
                    const granted = source[identityClaim] === currentUser.id;
                    if (!granted) {
                      reject();
                    }
                    permit();
                  });
                case AUTH_ROLE_STRATEGY:
                  return new Promise((permit, reject) => {
                    const granted = currentUser.hasRole(roles);
                    if (!granted) {
                      reject();
                    }
                    permit();
                  });
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
