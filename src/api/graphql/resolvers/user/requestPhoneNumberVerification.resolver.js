import dayjs from "~config/dayjs";
import { Accepted } from "~helpers/response";
import { SENT_SMS_OTP } from "~helpers/constants/i18n";
import { PHONE_NUMBER_KEY_PREFIX } from "~helpers/constants/tokens";
import sendSMS from "~services/sms";

export default {
  Mutation: {
    async requestPhoneNumberVerification(
      _parent,
      { phoneNumber },
      { dataSources, store, t, otp }
    ) {
      const user = await dataSources.users.updateCurrentUser({ phoneNumber });

      const { id, phoneNumberVerified } = user;
      const key = `${PHONE_NUMBER_KEY_PREFIX}:${id}`;
      const sentToken = await store.get(key);

      if (!(sentToken && phoneNumberVerified)) {
        const token = otp.getSmsOtp();
        const expiresIn = dayjs.duration(10, "hours").asSeconds();

        await store.set({
          key,
          value: token,
          expiresIn,
        });

        sendSMS(token, phoneNumber);
      }

      return Accepted({
        message: t(SENT_SMS_OTP, { phoneNumber }),
      });
    },
  },
};
