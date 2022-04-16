import { ForbiddenError } from "apollo-server-core";
import dayjs from "~utils/dayjs";
import analytics from "~services/analytics";
import QueryError from "~utils/errors/QueryError";
import emailTemplates from "~helpers/emailTemplates";
import { Fail, Success } from "~helpers/response";
import {
  EMAIL_NOT_VERIFIED,
  INCORRECT_USERNAME_OR_PASSWORD,
  WELCOME_BACK,
} from "~constants/i18n";
import {
  FAILED_LOGIN_ATTEMPT_KEY_PREFIX,
  MAX_LOGIN_ATTEMPTS,
} from "~constants/auth";
import { ACCOUNT_STATUS } from "~constants/models";

export default {
  Mutation: {
    async loginToAdmin(
      _parent,
      { input },
      { dataSources, jwt, t, cache, clientId, mailer, locale }
    ) {
      try {
        const [user, granted] =
          await dataSources.users.findAdminByUsernameAndPassword(input);

        if (user && granted && !user.emailVerified) {
          throw new QueryError(EMAIL_NOT_VERIFIED);
        }

        const attemptCountKey = `${FAILED_LOGIN_ATTEMPT_KEY_PREFIX}:${input.username}`;
        if (user && !granted) {
          const attempts = await cache.increment(attemptCountKey);
          if (attempts === MAX_LOGIN_ATTEMPTS) {
            mailer.sendEmail({
              template: emailTemplates.FAILED_LOGIN,
              message: {
                to: user.email,
              },
              locals: {
                locale,
                name: user.firstName,
              },
            });
          }
        }

        if (!granted) {
          throw new QueryError(INCORRECT_USERNAME_OR_PASSWORD);
        }

        if (
          [ACCOUNT_STATUS.BLOCKED, ACCOUNT_STATUS.LOCKED].includes(user.status)
        ) {
          throw new ForbiddenError(user.status);
        }

        await cache.remove(attemptCountKey);

        const { id, firstName } = user;

        await dataSources.users.update(id, {
          lastLogin: dayjs.utc().toDate(),
        });

        const { accessToken, refreshToken } = await jwt.generateAuthTokens({
          sub: id,
          aud: clientId,
        });

        analytics.track({
          userId: id,
          event: "Logged In Admin",
        });

        return Success({
          message: t(WELCOME_BACK, { firstName }),
          code: WELCOME_BACK,
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
