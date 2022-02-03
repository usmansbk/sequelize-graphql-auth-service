import { Fail, Success } from "~helpers/response";
import { SENT_SMS_OTP } from "~helpers/constants/i18n";
import {
  PHONE_NUMBER_KEY_PREFIX,
  SMS_OTP_EXPIRES_IN,
} from "~helpers/constants/auth";
import QueryError from "~utils/errors/QueryError";

export default {
  Mutation: {
    async requestPhoneNumberVerification(
      _parent,
      { phoneNumber },
      { dataSources, store, t, otp, mailer }
    ) {
      try {
        const user = await dataSources.users.updateCurrentUser({ phoneNumber });

        const { id, phoneNumberVerified } = user;
        const key = `${PHONE_NUMBER_KEY_PREFIX}:${id}`;
        const sentToken = await store.get(key);

        if (!(sentToken || phoneNumberVerified)) {
          const token = otp.getSmsOTP();

          await store.set({
            key,
            value: token,
            expiresIn: SMS_OTP_EXPIRES_IN,
          });

          mailer.sendSMS(token, phoneNumber);
        }

        return Success({
          message: t(SENT_SMS_OTP, { phoneNumber }),
          code: SENT_SMS_OTP,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
            errors: e.errors,
          });
        }
        throw e;
      }
    },
  },
};
