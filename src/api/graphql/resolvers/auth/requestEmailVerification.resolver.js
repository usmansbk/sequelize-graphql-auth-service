import links from "~helpers/links";
import { Success } from "~helpers/response";
import emailTemplates from "~helpers/emailTemplates";
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
      { locale, cache, t, jwt, clientId, mailer, dataSources }
    ) {
      const { firstName, id, emailVerified } = await dataSources.users.findOne({
        where: { email },
      });

      const key = `${EMAIL_VERIFICATION_KEY_PREFIX}:${id}`;

      if (!emailVerified) {
        const { token, exp } = jwt.generateToken(
          {
            aud: clientId,
            sub: id,
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

      return Success({
        message: t(SENT_VERIFICATION_EMAIL, { email }),
        code: SENT_VERIFICATION_EMAIL,
      });
    },
  },
};
