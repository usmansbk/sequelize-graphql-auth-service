import links from "~helpers/links";
import { Success, Fail } from "~helpers/response";
import emailTemplates from "~helpers/emailTemplates";
import QueryError from "~utils/errors/QueryError";
import { ACCOUNT_STATUS } from "~helpers/constants/models";
import { SENT_VERIFICATION_EMAIL } from "~helpers/constants/responseCodes";
import {
  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN,
  EMAIL_VERIFICATION_KEY_PREFIX,
} from "~helpers/constants/auth";

export default {
  Mutation: {
    async requestEmailVerification(
      _parent,
      { email },
      { locale, cache, t, jwt, mailer, dataSources, clients }
    ) {
      try {
        const user = await dataSources.users.findOne({
          where: { email },
        });

        if (user) {
          const { firstName, id, emailVerified, status } = user;

          if ([ACCOUNT_STATUS.BLOCKED].includes(status)) {
            throw new QueryError(status);
          }

          if (!emailVerified) {
            const key = `${EMAIL_VERIFICATION_KEY_PREFIX}:${id}`;
            const { token, exp } = jwt.generateToken(
              {
                sub: id,
                aud: clients,
              },
              EMAIL_VERIFICATION_TOKEN_EXPIRES_IN
            );

            await cache.set(key, token, exp);

            mailer.sendEmail({
              template: emailTemplates.VERIFY_EMAIL,
              message: {
                to: email,
              },
              locals: {
                locale,
                name: firstName,
                link: links.verifyEmail(token),
              },
            });
          }
        }

        return Success({
          message: t(SENT_VERIFICATION_EMAIL, { email }),
          code: SENT_VERIFICATION_EMAIL,
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
