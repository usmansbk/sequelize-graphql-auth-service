import { Fail, Success } from "~helpers/response";
import {
  EMAIL_VERIFICATION_FAILED,
  EMAIL_VERIFIED,
} from "~helpers/constants/responseCodes";
import QueryError from "~utils/errors/QueryError";
import { EMAIL_VERIFICATION_KEY_PREFIX } from "~helpers/constants/auth";
import emailTemplates from "~helpers/emailTemplates";
import { ACCOUNT_STATUS } from "~helpers/constants/models";
import analytics from "~services/analytics";

export default {
  Mutation: {
    async verifyEmail(
      _parent,
      { token },
      { dataSources, cache, t, jwt, mailer, locale, clientId }
    ) {
      try {
        const { sub } = jwt.verify(token, { clientId });
        const key = `${EMAIL_VERIFICATION_KEY_PREFIX}:${sub}`;

        const expectedToken = await cache.getAndDelete(key);

        if (token !== expectedToken) {
          throw new QueryError(EMAIL_VERIFICATION_FAILED);
        }

        const user = await dataSources.users.findByPk(sub);

        if (!user) {
          throw new QueryError(EMAIL_VERIFICATION_FAILED);
        }

        const { status, emailVerified, firstName, email, id } = user;

        if ([ACCOUNT_STATUS.BLOCKED].includes(status)) {
          throw new QueryError(status);
        }

        if (!emailVerified) {
          await dataSources.users.update(id, {
            emailVerified: true,
            status: ACCOUNT_STATUS.ACTIVE,
          });

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
            userId: id,
            event: "Verified Email",
            properties: {
              email,
            },
          });
        }

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
