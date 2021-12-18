import MutationError from "~utils/errors/MutationError";
import { WELCOME_NEW_USER } from "~helpers/constants";
import sendMail from "~services/mailer";

export default {
  Mutation: {
    async registerWithEmail(_, { input }, { dataSources, jwt, t, locale }) {
      try {
        const { id, firstName, language, email } =
          await dataSources.users.createWithEmail(input);

        const { accessToken, refreshToken } = await jwt.getAuthTokens({
          id,
          language,
        });

        const token = await jwt.getToken(email);

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
          message: t(WELCOME_NEW_USER, { firstName }),
          accessToken,
          refreshToken,
        };
      } catch (e) {
        if (e instanceof MutationError) {
          return {
            success: false,
            message: t(e.message),
            errors: e.cause.errors,
          };
        } else {
          throw e;
        }
      }
    },
  },
};
