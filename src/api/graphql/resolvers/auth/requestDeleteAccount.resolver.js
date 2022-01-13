import sendMail from "~services/mailer";
import UrlFactory from "~helpers/urls";
import { Accepted } from "~helpers/response";
import emailTemplates from "~helpers/constants/emailTemplates";
import { SENT_CONFIRM_DELETE_ACCOUNT_EMAIL } from "~helpers/constants/i18n";
import { DELETE_ACCOUNT_TOKEN_EXPIRES_IN } from "~helpers/constants/tokens";

export default {
  Mutation: {
    async requestDeleteAccount(
      _,
      _args,
      { dataSources, locale, store, t, jwt, clientId }
    ) {
      const user = await dataSources.users.currentUser();

      const { language, firstName, id, email } = user;

      const { token, exp } = jwt.generateToken(
        {
          aud: clientId,
          sub: id,
        },
        DELETE_ACCOUNT_TOKEN_EXPIRES_IN
      );

      await store.set({
        key: id,
        value: token,
        expiresIn: exp,
      });

      sendMail({
        template: emailTemplates.CONFIRM_DELETE_ACCOUNT,
        message: {
          to: email,
        },
        locals: {
          locale: language || locale,
          name: firstName,
          link: UrlFactory.deleteAccount(token),
        },
      });

      return Accepted({
        message: t(SENT_CONFIRM_DELETE_ACCOUNT_EMAIL, { email }),
      });
    },
  },
};
