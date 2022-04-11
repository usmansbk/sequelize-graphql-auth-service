import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { INCORRECT_EMAIL_OR_PASSWORD, WELCOME_BACK } from "~constants/i18n";
import emailTemplates from "~helpers/emailTemplates";
import {
  FAILED_LOGIN_ATTEMPT_KEY_PREFIX,
  MAX_LOGIN_ATTEMPTS,
} from "~constants/auth";
import { ACCOUNT_STATUS } from "~constants/models";
import analytics from "~services/analytics";

export default {
  Mutation: {
    async loginWithEmail(
      _parent,
      { input },
      { dataSources, jwt, t, cache, clientId, mailer, locale }
    ) {
      try {
        const [user, granted] = await dataSources.users.findByEmailAndPassword(
          input
        );

        const attemptCountKey = `${FAILED_LOGIN_ATTEMPT_KEY_PREFIX}:${input.email}`;
        if (user && !granted) {
          const attempts = await cache.increment(attemptCountKey);
          if (attempts === MAX_LOGIN_ATTEMPTS) {
            await dataSources.users.update(user.id, {
              status: ACCOUNT_STATUS.LOCKED,
            });
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
          throw new QueryError(INCORRECT_EMAIL_OR_PASSWORD);
        }

        await cache.remove(attemptCountKey);

        const { id, firstName, email, username, fullName } = user;

        const { accessToken, refreshToken, sid, exp } = jwt.generateAuthTokens({
          sub: id,
          aud: clientId,
        });

        // refresh token rotation
        await cache.set({
          key: `${clientId}:${id}`,
          value: sid,
          expiresIn: exp,
        });

        analytics.track({
          userId: id,
          event: "Logged In",
          properties: {
            fullName,
            email,
            username,
            locale,
            client: clientId,
            provider: "email",
          },
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
