import links from "~helpers/links";
import { Success } from "~helpers/response";
import emailTemplates from "~helpers/emailTemplates";
import { SENT_VERIFICATION_EMAIL } from "~constants/i18n";
import {
  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN,
  EMAIL_VERIFICATION_KEY_PREFIX,
} from "~constants/auth";

export default {
  Mutation: {
    async requestEmailVerification(
      _parent,
      _args,
      { locale, store, t, jwt, clientId, mailer, currentUser }
    ) {
      const { firstName, id, email, emailVerified } = currentUser;
      const key = `${EMAIL_VERIFICATION_KEY_PREFIX}:${id}`;

      const sentToken = await store.get(key);

      if (!(sentToken || emailVerified)) {
        const { token, exp } = jwt.generateToken(
          {
            aud: clientId,
            sub: id,
          },
          EMAIL_VERIFICATION_TOKEN_EXPIRES_IN
        );

        await store.set({
          key,
          value: token,
          expiresIn: exp,
        });

        mailer.sendEmail({
          template: emailTemplates.VERIFY_EMAIL,
          message: {
            to: email,
          },
          locals: {
            locale: currentUser.locale || locale,
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
