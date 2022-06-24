import { ForbiddenError } from "apollo-server-core";
import analytics from "~services/analytics";
import dayjs from "~utils/dayjs";
import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import {
  WELCOME_BACK,
  WELCOME_NEW_USER,
} from "~helpers/constants/responseCodes";
import { ACCOUNT_STATUS } from "~helpers/constants/models";

export default {
  Mutation: {
    async loginWithSocialProvider(
      _parent,
      { input },
      { t, dataSources, jwt, cache, clientId }
    ) {
      try {
        const userInfo = await jwt.verifySocialToken(input);
        const [user, created] = await dataSources.users.findOrCreate({
          ...userInfo,
          status: ACCOUNT_STATUS.ACTIVE,
        });

        if (
          [ACCOUNT_STATUS.BLOCKED, ACCOUNT_STATUS.LOCKED].includes(user.status)
        ) {
          throw new ForbiddenError(user.status);
        }

        const { id, firstName } = user;

        await dataSources.users.update(id, {
          lastLogin: dayjs.utc().toDate(),
        });

        const { accessToken, refreshToken, sid, exp } = await jwt.getAuthTokens(
          id,
          {
            clientId,
          }
        );

        await cache.set(`${clientId}:${id}`, sid, exp);

        analytics.track({
          userId: id,
          event: "Logged In",
          properties: {
            provider: input.provider,
          },
        });

        const code = created ? WELCOME_NEW_USER : WELCOME_BACK;
        return Success({
          message: t(code, { firstName }),
          code,
          accessToken,
          refreshToken,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
          });
        }
        throw e;
      }
    },
  },
};
