import dayjs from "~config/dayjs";
import { Accepted } from "~helpers/response";
import { SENT_VERIFICATION_EMAIL } from "~helpers/constants/i18n";

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
      const exp = dayjs.duration(10, "hours").asSeconds();

      await store.set({
        key: token,
        value: id,
        expiresIn: exp,
      });

      // send SMS

      return Accepted({
        message: t(SENT_VERIFICATION_EMAIL, { phoneNumber }),
      });
    },
  },
};
