import { Fail, Success } from "~helpers/response";
import emailTemplates from "~helpers/emailTemplates";
import { EMAIL_NOT_VERIFIED, SENT_EMAIL_OTP } from "~constants/i18n";
import { EMAIL_OTP_EXPIRES_IN, OTP_KEY_PREFIX } from "~constants/auth";
import QueryError from "~utils/errors/QueryError";

export default {
  Mutation: {
    async requestEmailOTP(
      _parent,
      { email },
      { locale, store, t, otp, mailer, dataSources }
    ) {
      try {
        const { firstName, id, emailVerified } =
          await dataSources.users.findOne({ where: { email } });

        const key = `${OTP_KEY_PREFIX}:${id}`;
        const sentToken = await store.get(key);

        if (!emailVerified) {
          throw new QueryError(EMAIL_NOT_VERIFIED);
        }

        if (!sentToken) {
          const token = otp.getEmailOTP();

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
              locale,
              name: firstName,
              token,
            },
          });
        }

        return Success({
          message: t(SENT_EMAIL_OTP),
          code: SENT_EMAIL_OTP,
        });
      } catch (e) {
        return Fail({
          message: t(e.message),
          code: e.code,
        });
      }
    },
  },
};
