import sendMail from "~services/mailer";
import { SENT_VERIFICATION_EMAIL } from "~helpers/constants";

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
          const { language, firstName } = user;

          const { token, ex } = jwt.getToken(2);

          await redis.setex(email, ex, token);

          sendMail({
            template: "verify_email",
            message: {
              to: email,
            },
            locals: {
              locale: language || locale,
              name: firstName,
              link: `/verify_email?token=${token}`,
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
