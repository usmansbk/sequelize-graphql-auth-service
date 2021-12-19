import sendMail from "~services/mailer";
import { SENT_VERIFICATION_EMAIL } from "~helpers/constants";
import { hostURL } from "~helpers/url";

export default {
  Mutation: {
    async requestEmailVerification(
      _,
      { email },
      { dataSources, locale, jwt, redis, t }
    ) {
      const prevToken = await redis.get(email);

      if (!prevToken) {
        const user = await dataSources.users.findOne({
          where: {
            email,
          },
        });

        if (user) {
          const { language, firstName, id } = user;

          const { token, ex } = jwt.getToken({ id }, 2);

          await redis.setex(id, ex, token);

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
      }

      return {
        success: true,
        message: t(SENT_VERIFICATION_EMAIL, { email }),
      };
    },
  },
};
