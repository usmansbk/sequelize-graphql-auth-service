import MutationError from "~utils/errors/MutationError";
import sendMail from "~services/mailer";

export default {
  Mutation: {
    async requestEmailVerification(
      _,
      { email },
      { dataSources, locale, jwt, redis, t }
    ) {
      try {
        const user = await dataSources.users.findOne({
          where: {
            email,
          },
        });

        if (!user) {
          throw new MutationError("No account found");
        }

        const { language, firstName } = user;

        const { token, ex } = jwt.getToken();

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

        return {
          success: true,
          message: `If an account exist, We would send an email with further instructions.`,
        };
      } catch (e) {
        if (e instanceof MutationError) {
          return {
            success: false,
            message: t(e.message, { email }),
          };
        } else {
          throw e;
        }
      }
    },
  },
};
