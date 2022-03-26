import links from "~helpers/links";
import { Success } from "~helpers/response";
import emailTemplates from "~helpers/emailTemplates";
import { SENT_CONFIRM_DELETE_ACCOUNT_EMAIL } from "~constants/i18n";
import {
  DELETE_ACCOUNT_KEY_PREFIX,
  DELETE_ACCOUNT_TOKEN_EXPIRES_IN,
} from "~constants/auth";

export default {
  Mutation: {
    async requestDeleteAccount(
      _parent,
      _args,
      { dataSources, locale, store, t, jwt, clientId, mailer }
    ) {
      const user = await dataSources.users.currentUser();

      const { language, firstName, id, email } = user;
      const key = `${DELETE_ACCOUNT_KEY_PREFIX}:${id}`;
      const sentToken = await store.get(key);

      if (!sentToken) {
        const { token, exp } = jwt.generateToken(
          {
            aud: clientId,
            sub: id,
          },
          DELETE_ACCOUNT_TOKEN_EXPIRES_IN
        );

        await store.set({
          key,
          value: token,
          expiresIn: exp,
        });

        mailer.sendEmail({
          template: emailTemplates.CONFIRM_DELETE_ACCOUNT,
          message: {
            to: email,
          },
          locals: {
            locale: language || locale,
            name: firstName,
            link: links.deleteAccount(token),
          },
        });
      }

      return Success({
        message: t(SENT_CONFIRM_DELETE_ACCOUNT_EMAIL, { email }),
        code: SENT_CONFIRM_DELETE_ACCOUNT_EMAIL,
      });
    },
  },
};
