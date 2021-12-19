import sendMail from "~services/mailer";
import { SENT_VERIFICATION_EMAIL } from "~helpers/constants";
import { hostURL } from "~helpers/url";

export default {
  Mutation: {
    async requestEmailVerification(
      _,
      { email },
      { dataSources, locale, redis, t, jwt }
    ) {
      const user = await dataSources.users.findOne({
        where: {
          email,
        },
      });

      if (user) {
        const { language, firstName, id } = user;

        const { token, ex } = jwt.getToken({ id }, 60 * 24);

        await redis.setex(token, ex, email);

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
