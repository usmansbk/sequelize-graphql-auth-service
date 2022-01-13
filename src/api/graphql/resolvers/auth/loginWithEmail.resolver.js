import QueryError from "~utils/errors/QueryError";
import { WELCOME_EXISTING_USER } from "~helpers/constants/i18n";
import { BadRequest, Ok } from "~helpers/response";
import { ID_TOKEN_EXP } from "~helpers/constants/tokens";

export default {
  Mutation: {
    async loginWithEmail(
      _,
      { input },
      { dataSources, jwt, t, store, clientId }
    ) {
      try {
        const { id, firstName, lastName, fullName, language } =
          await dataSources.users.findByEmailAndPassword(input);

        const { token: idToken } = jwt.generateToken(
          {
            firstName,
            lastName,
            fullName,
            language,
            aud: clientId,
          },
          ID_TOKEN_EXP
        );

        const { accessToken, refreshToken, refreshTokenId, exp } =
          jwt.generateAuthTokens({
            sub: id,
            aud: clientId,
            language,
          });

        // refresh token rotation
        await store.setValue({
          key: `${id}:${clientId}`,
          value: refreshTokenId,
          expiresIn: exp,
        });

        return Ok({
          message: t(WELCOME_EXISTING_USER, { firstName }),
          idToken,
          accessToken,
          refreshToken,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return BadRequest({
            message: t(e.message),
          });
        }
        throw e;
      }
    },
  },
};
