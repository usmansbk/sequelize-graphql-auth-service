import { nanoid } from "nanoid";
import dayjs from "~config/dayjs";
import sendMail from "~services/mailer";
import links from "~helpers/links";
import { Accepted } from "~helpers/response";
import emailTemplates from "~helpers/constants/emailTemplates";
import { SENT_VERIFICATION_EMAIL } from "~helpers/constants/i18n";

export default {
  Mutation: {
    async requestEmailOTP(_, { email }, { dataSources, locale, store, t }) {
      const user = await dataSources.users.findOne({
        where: {
          email,
        },
      });

      if (user) {
        const { language, firstName, id } = user;

        const token = nanoid(6);
        const exp = dayjs.duration(5, "minutes").asSeconds();

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
            link: links.verifyEmail(token),
          },
        });
      }

      return Accepted({
        message: t(SENT_VERIFICATION_EMAIL, { email }),
      });
    },
  },
};