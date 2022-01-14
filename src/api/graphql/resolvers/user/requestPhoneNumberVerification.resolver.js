import dayjs from "~config/dayjs";
import { Accepted } from "~helpers/response";
import { SENT_SMS_OTP } from "~helpers/constants/i18n";
import { PHONE_NUMBER_TOKEN_PREFIX } from "~helpers/constants/tokens";

export default {
  Mutation: {
    async requestPhoneNumberVerification(
      _,
      { phoneNumber },
      { dataSources, store, t, otp }
    ) {
      const user = await dataSources.users.updateCurrentUser({ phoneNumber });

      const { id } = user;

      const token = otp.getSmsOtp();
      const expiresIn = dayjs.duration(10, "hours").asSeconds();

      await store.set({
        key: `${PHONE_NUMBER_TOKEN_PREFIX}:${id}`,
        value: token,
        expiresIn,
      });

      // send SMS

      return Accepted({
        message: t(SENT_SMS_OTP, { phoneNumber }),
      });
    },
  },
};
