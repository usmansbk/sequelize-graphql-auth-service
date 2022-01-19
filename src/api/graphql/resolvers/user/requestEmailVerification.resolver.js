import sendMail from "~services/email";
import links from "~helpers/links";
import { Success } from "~helpers/response";
import emailTemplates from "~helpers/emailTemplates";
import { SENT_VERIFICATION_EMAIL } from "~helpers/constants/i18n";
import {
  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN,
  EMAIL_VERIFICATION_KEY_PREFIX,
} from "~helpers/constants/auth";

export default {
  Mutation: {
    async requestEmailVerification(
      _parent,
      _args,
      { dataSources, locale, store, t, jwt, clientId }
    ) {
      const user = await dataSources.users.currentUser();

      const { language, firstName, id, email, emailVerified } = user;
      const key = `${EMAIL_VERIFICATION_KEY_PREFIX}:${id}`;

      const sentToken = await store.get(key); // rate limiter

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

        sendMail({
          template: emailTemplates.VERIFY_EMAIL,
          message: {
            to: email,
          },
          locals: {
            locale: language || locale,
            name: firstName,
            link: links.verifyEmail(token),
          },
        });
      }

      return Success({
        message: t(SENT_VERIFICATION_EMAIL, { email }),
      });
    },
  },
};
