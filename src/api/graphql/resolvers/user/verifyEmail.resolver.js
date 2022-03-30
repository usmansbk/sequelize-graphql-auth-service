import { Fail, Success } from "~helpers/response";
import { EMAIL_VERIFIED, INVALID_LINK } from "~constants/i18n";
import QueryError from "~utils/errors/QueryError";
import { EMAIL_VERIFICATION_KEY_PREFIX } from "~constants/auth";
import emailTemplates from "~helpers/emailTemplates";

export default {
  Mutation: {
    async verifyEmail(
      _parent,
      { token },
      { dataSources, store, t, jwt, mailer, locale }
    ) {
      try {
        const { sub: id } = jwt.verify(token);
        const key = `${EMAIL_VERIFICATION_KEY_PREFIX}:${id}`;

        const expectedToken = await store.get(key);

        if (token !== expectedToken) {
          throw new QueryError(INVALID_LINK);
        }

        const user = await dataSources.users.verifyEmail(id);

        await store.remove(key);

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

        return Success({
          message: t(EMAIL_VERIFIED),
          code: EMAIL_VERIFIED,
          user,
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
