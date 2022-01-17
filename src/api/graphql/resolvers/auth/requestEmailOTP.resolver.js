import dayjs from "~utils/dayjs";
import sendMail from "~services/mailer";
import { Accepted } from "~helpers/response";
import emailTemplates from "~helpers/emailTemplates";
import { SENT_EMAIL_OTP } from "~helpers/constants/i18n";
import { EMAIL_OTP_KEY_PREFIX } from "~helpers/constants/auth";

export default {
  Mutation: {
    async requestEmailOTP(
      _parent,
      _args,
      { dataSources, locale, store, t, otp }
    ) {
      const user = await dataSources.users.currentUser();

      const { language, firstName, id, email } = user;
      const key = `${EMAIL_OTP_KEY_PREFIX}:${id}`;
      const sentToken = await store.get(key);

      if (!sentToken) {
        const token = otp.getEmailOtp();
        const expiresIn = dayjs.duration(5, "minutes").asSeconds();

        await store.set({
          key,
          value: token,
          expiresIn,
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
