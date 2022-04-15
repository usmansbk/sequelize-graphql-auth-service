import { Fail, Success } from "~helpers/response";
import { EMAIL_VERIFIED, INVALID_LINK } from "~constants/i18n";
import QueryError from "~utils/errors/QueryError";
import { EMAIL_VERIFICATION_KEY_PREFIX } from "~constants/auth";
import emailTemplates from "~helpers/emailTemplates";
import { ACCOUNT_STATUS } from "~constants/models";
import analytics from "~services/analytics";

export default {
  Mutation: {
    async verifyEmail(
      _parent,
      { token },
      { dataSources, cache, t, jwt, mailer, locale }
    ) {
      try {
        const { sub } = jwt.verify(token);
        const key = `${EMAIL_VERIFICATION_KEY_PREFIX}:${sub}`;

        const expectedToken = await cache.getAndDelete(key);

        if (token !== expectedToken) {
          throw new QueryError(INVALID_LINK);
        }

        const user = await dataSources.users.update(sub, {
          emailVerified: true,
          status: ACCOUNT_STATUS.ACTIVE,
        });

        const { email, firstName } = user;

        mailer.sendEmail({
          template: emailTemplates.WELCOME,
          message: {
            to: email,
          },
          locals: {
            locale: user.locale || locale,
            name: firstName,
          },
        });

        analytics.track({
          userId: sub,
          event: "Verified Email",
          properties: {
            email,
          },
        });

        return Success({
          message: t(EMAIL_VERIFIED),
          code: EMAIL_VERIFIED,
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
