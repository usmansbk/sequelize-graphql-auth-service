import { Fail, Success } from "~helpers/response";
import { SENT_SMS_OTP } from "~constants/i18n";
import { PHONE_NUMBER_KEY_PREFIX, SMS_OTP_EXPIRES_IN } from "~constants/auth";
import QueryError from "~utils/errors/QueryError";

export default {
  Mutation: {
    async requestCurrentUserPhoneNumberVerification(
      _parent,
      { phoneNumber },
      { currentUser, cache, t, otp, mailer, dataSources }
    ) {
      try {
        const user = await dataSources.users.update(currentUser.id, {
          phoneNumber,
        });

        const { id, phoneNumberVerified } = user;
        const key = `${PHONE_NUMBER_KEY_PREFIX}:${id}`;
        const sentToken = await cache.exists(key);

        if (!(sentToken || phoneNumberVerified)) {
          const token = otp.getNumberCode();

          await cache.set(key, token, SMS_OTP_EXPIRES_IN);

          mailer.sendSMS(token, phoneNumber);
        }

        return Success({
          message: t(SENT_SMS_OTP, { phoneNumber }),
          code: SENT_SMS_OTP,
          user,
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
