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

export default {
  Mutation: {
    async loginToAdmin(
      _parent,
      { input },
      { dataSources, jwt, t, store, clientId, mailer, locale }
    ) {
      try {
        const [user, granted] =
          await dataSources.users.findAdminByUsernameAndPassword(input);

        if (user && granted && !user.emailVerified) {
          throw new QueryError(EMAIL_NOT_VERIFIED);
        }

        const attemptCountKey = `${FAILED_LOGIN_ATTEMPT_KEY_PREFIX}:${input.username}`;
        if (user && !granted) {
          const attempts = await store.increment(attemptCountKey);
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

        await store.remove(attemptCountKey);

        const { id, firstName } = user;

        const { accessToken, refreshToken, sid, exp } = jwt.generateAuthTokens({
          sub: id,
          aud: clientId,
        });

        // refresh token rotation
        await store.set({
          key: `${clientId}:${id}`,
          value: sid,
          expiresIn: exp,
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
