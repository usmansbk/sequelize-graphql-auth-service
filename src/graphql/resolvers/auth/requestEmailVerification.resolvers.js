import sendMail from "~services/mailer";
import UrlFactory from "~helpers/urls";
import { Accepted } from "~helpers/response";
import emailTemplates from "~helpers/constants/emailTemplates";
import { SENT_VERIFICATION_EMAIL } from "~helpers/constants/i18n";

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

        const { token, exp } = jwt.generateToken({ id }, 60 * 24);

        await redis.setex(token, exp, email);

        sendMail({
          template: emailTemplates.VERIFY_EMAIL,
          message: {
            to: email,
          },
          locals: {
            locale: language || locale,
            name: firstName,
            link: UrlFactory.verifyEmail(token),
          },
        });
      }

      return Accepted({
        message: t(SENT_VERIFICATION_EMAIL, { email }),
      });
    },
  },
};
