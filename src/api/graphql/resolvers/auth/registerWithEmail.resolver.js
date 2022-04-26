import { ForbiddenError } from "apollo-server-core";
import analytics from "~services/analytics";
import QueryError from "~utils/errors/QueryError";
import { Success, Fail } from "~helpers/response";
import { SIGNUP_FAILED, WELCOME_NEW_USER } from "~constants/i18n";
import { ACCOUNT_STATUS } from "~constants/models";

export default {
  Mutation: {
    async registerWithEmail(
      _parent,
      { input },
      { dataSources, jwt, t, clientId }
    ) {
      try {
        const existingUser = await dataSources.users.findOne({
          where: {
            email: input.email,
          },
        });

        if (existingUser) {
          if (
            [ACCOUNT_STATUS.BLOCKED, ACCOUNT_STATUS.LOCKED].includes(
              existingUser.status
            )
          ) {
            throw new ForbiddenError(existingUser.status);
          }
          if (existingUser.status === ACCOUNT_STATUS.PROVISIONED) {
            await dataSources.users.destroy(existingUser.id);
          }
        }
        const { id, firstName } = await dataSources.users.create(input);

        const { accessToken, refreshToken } = await jwt.generateAuthTokens({
          sub: id,
          aud: clientId,
        });

        analytics.track({
          userId: id,
          event: "Signed Up",
        });
        return Success({
          message: t(WELCOME_NEW_USER, { firstName }),
          code: WELCOME_NEW_USER,
          accessToken,
          refreshToken,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(SIGNUP_FAILED),
            code: e.code,
            errors: e.errors,
          });
        }
        throw e;
      }
    },
  },
};
