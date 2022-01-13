import { nanoid } from "nanoid";
import dayjs from "~config/dayjs";
import sendMail from "~services/mailer";
import UrlFactory from "~helpers/urls";
import { Accepted } from "~helpers/response";
import emailTemplates from "~helpers/constants/emailTemplates";
import { SENT_RESET_PASSWORD_EMAIL } from "~helpers/constants/i18n";

export default {
  Mutation: {
    async requestPasswordReset(
      _,
      { email },
      { dataSources, locale, store, t }
    ) {
      const user = await dataSources.users.findOne({
        where: {
          email,
        },
      });

      if (user) {
        const { language, firstName, id } = user;

        const token = nanoid();
        const exp = dayjs.duration(20, "minutes").asSeconds();

        await store.set({
          key: token,
          value: id,
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
            link: UrlFactory.resetPassword(token),
          },
        });
      }

      return Accepted({
        message: t(SENT_RESET_PASSWORD_EMAIL, { email }),
      });
    },
  },
};
