import { nanoid } from "nanoid";
import dayjs from "~config/dayjs";
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
      { dataSources, locale, store, t }
    ) {
      const user = await dataSources.users.findOne({
        where: {
          email,
        },
      });

      if (user) {
        const { language, firstName, id } = user;

        const token = nanoid();
        const exp = dayjs.duration(10, "hours").asSeconds();

        await store.set({
          key: token,
          value: id,
          expiresIn: exp,
        });

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
