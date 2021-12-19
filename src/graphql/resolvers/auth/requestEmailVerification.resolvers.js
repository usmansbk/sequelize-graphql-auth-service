import { nanoid } from "nanoid";
import dayjs from "~config/dayjs";
import sendMail from "~services/mailer";
import { SENT_VERIFICATION_EMAIL } from "~helpers/constants";
import { hostURL } from "~helpers/url";

export default {
  Mutation: {
    async requestEmailVerification(
      _,
      { email },
      { dataSources, locale, redis, t }
    ) {
      const user = await dataSources.users.findOne({
        where: {
          email,
        },
      });

      if (user) {
        const { language, firstName } = user;

        const token = nanoid();
        const expiresIn = dayjs.duration(1, "day").asSeconds();

        await redis.setex(token, expiresIn, email);

        sendMail({
          template: "verify_email",
          message: {
            to: email,
          },
          locals: {
            locale: language || locale,
            name: firstName,
            link: hostURL(`/verify_email?token=${token}`),
          },
        });
      }

      return {
        success: true,
        message: t(SENT_VERIFICATION_EMAIL, { email }),
      };
    },
  },
};
