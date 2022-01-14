import sendMail from "~services/mailer";
import links from "~helpers/links";
import { Accepted } from "~helpers/response";
import emailTemplates from "~helpers/constants/emailTemplates";
import { SENT_RESET_PASSWORD_EMAIL } from "~helpers/constants/i18n";
import {
  PASSWORD_KEY_PREFIX,
  RESET_PASSWORD_TOKEN_EXPIRES_IN,
} from "~helpers/constants/tokens";

export default {
  Mutation: {
    async requestPasswordReset(
      _,
      { email },
      { dataSources, locale, store, t, jwt, clientId }
    ) {
      const user = await dataSources.users.findOne({
        where: {
          email,
        },
      });

      if (user) {
        const { language, firstName, id } = user;
        const key = `${PASSWORD_KEY_PREFIX}:${id}`;
        const sentToken = await store.get(key);

        if (!sentToken) {
          const { token, exp } = jwt.generateToken(
            {
              aud: clientId,
              sub: id,
            },
            RESET_PASSWORD_TOKEN_EXPIRES_IN
          );

          await store.set({
            key,
            value: token,
            expiresIn: exp,
          });

          sendMail({
            template: emailTemplates.RESET_PASSWORD,
            message: {
              to: email,
            },
            locals: {
              locale: language || locale,
              name: firstName,
              link: links.resetPassword(token),
            },
          });
        }
      }

      return Accepted({
        message: t(SENT_RESET_PASSWORD_EMAIL, { email }),
      });
    },
  },
};
