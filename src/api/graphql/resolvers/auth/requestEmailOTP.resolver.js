import { nanoid } from "nanoid";
import dayjs from "~config/dayjs";
import sendMail from "~services/mailer";
import { Accepted } from "~helpers/response";
import emailTemplates from "~helpers/constants/emailTemplates";
import { SENT_EMAIL_OTP } from "~helpers/constants/i18n";

export default {
  Mutation: {
    async requestEmailOTP(_, _args, { dataSources, locale, store, t }) {
      const user = await dataSources.users.currentUser();

      if (user) {
        const { language, firstName, id, email } = user;

        const token = nanoid(8);
        const exp = dayjs.duration(5, "minutes").asSeconds();

        await store.set({
          key: id,
          value: token,
          expiresIn: exp,
        });

        sendMail({
          template: emailTemplates.OTP,
          message: {
            to: email,
          },
          locals: {
            locale: language || locale,
            name: firstName,
            token,
          },
        });
      }

      return Accepted({
        message: t(SENT_EMAIL_OTP),
      });
    },
  },
};
