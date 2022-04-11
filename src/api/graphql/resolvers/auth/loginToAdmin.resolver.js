import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import {
  EMAIL_NOT_VERIFIED,
  INCORRECT_USERNAME_OR_PASSWORD,
  WELCOME_BACK,
} from "~constants/i18n";
import emailTemplates from "~helpers/emailTemplates";
import {
  FAILED_LOGIN_ATTEMPT_KEY_PREFIX,
  MAX_LOGIN_ATTEMPTS,
} from "~constants/auth";
import analytics from "~services/analytics";

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

        await cache.remove(attemptCountKey);

        const { id, firstName, username, email, fullName } = user;

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
          event: "Logged In Admin",
          properties: {
            username,
            email,
            fullName,
            clientId,
            locale,
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
