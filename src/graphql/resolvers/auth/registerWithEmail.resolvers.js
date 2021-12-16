import MutationError from "~utils/errors/MutationError";
import { WELCOME_NEW_USER } from "~helpers/constants";
import sendMail from "~services/mailer";

export default {
  Mutation: {
    async registerWithEmail(
      _,
      { input },
      { dataSources, jwt, redis, t, locale }
    ) {
      try {
        const { id, firstName, language, email } =
          await dataSources.users.createWithEmail(input);

        const { accessToken, refreshToken, tokenId, expiresIn } =
          jwt.getAuthTokens({
            id,
            language,
          });
        await redis.set(tokenId, refreshToken, "EX", expiresIn);

        const linkExp = 5; // minutes
        const { token, expiresIn: linkExpiresIn } = jwt.getToken(
          { verify: id },
          linkExp
        );

        await redis.set(email, token, "EX", linkExpiresIn);

        sendMail({
          template: "verify_email",
          message: {
            to: email,
          },
          locals: {
            locale: language || locale,
            name: firstName,
            link: `/verify_email?token=${token}`,
            expiresIn: linkExp,
          },
        });

        return {
          success: true,
          message: t(WELCOME_NEW_USER, { firstName }),
          accessToken,
          refreshToken,
        };
      } catch (e) {
        console.log(e.message);
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
