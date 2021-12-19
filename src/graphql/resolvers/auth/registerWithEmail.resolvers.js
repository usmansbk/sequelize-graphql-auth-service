import MutationError from "~utils/errors/MutationError";
import { WELCOME_NEW_USER } from "~helpers/constants";
import { hostURL } from "~helpers/url";
import sendMail from "~services/mailer";

export default {
  Mutation: {
    async registerWithEmail(
      _,
      { input },
      { dataSources, jwt, t, locale, redis }
    ) {
      try {
        const { id, firstName, language, email } =
          await dataSources.users.createWithEmail(input);

        const { accessToken, refreshToken, tokenId, ex } = jwt.getAuthTokens({
          id,
          language,
        });
        await redis.setex(tokenId, ex, refreshToken); // refresh token rotation

        const { token, ex: expiresIn } = jwt.getToken(2);

        await redis.setex(email, expiresIn, token);

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
