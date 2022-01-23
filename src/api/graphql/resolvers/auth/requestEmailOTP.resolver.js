import { Success } from "~helpers/response";
import emailTemplates from "~helpers/emailTemplates";
import { SENT_EMAIL_OTP } from "~helpers/constants/i18n";
import {
  EMAIL_OTP_EXPIRES_IN,
  EMAIL_OTP_KEY_PREFIX,
} from "~helpers/constants/auth";

export default {
  Mutation: {
    async requestEmailOTP(
      _parent,
      _args,
      { dataSources, locale, store, t, otp, mailer }
    ) {
      const user = await dataSources.users.currentUser();

      const { language, firstName, id, email } = user;
      const key = `${EMAIL_OTP_KEY_PREFIX}:${id}`;
      const sentToken = await store.get(key);

      if (!sentToken) {
        const token = otp.getEmailOtp();

        await store.set({
          key,
          value: token,
          expiresIn: EMAIL_OTP_EXPIRES_IN,
        });

        mailer.sendEmail({
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

      return Success({
        message: t(SENT_EMAIL_OTP),
      });
    },
  },
};
