import QueryError from "~utils/errors/QueryError";
import { BadRequest, Ok } from "~helpers/response";
import {
  INCORRECT_EMAIL_OR_PASSWORD,
  WELCOME_BACK,
} from "~helpers/constants/i18n";
import { ID_TOKEN_EXPIRES_IN } from "~helpers/constants/auth";

export default {
  Mutation: {
    async loginWithEmail(
      _parent,
      { input },
      { dataSources, jwt, t, store, clientId }
    ) {
      try {
        const user = await dataSources.users.findByEmailAndPassword(input);

        if (!user) {
          throw new QueryError(INCORRECT_EMAIL_OR_PASSWORD);
        }

        const { id, firstName, lastName, fullName, language } = user;

        const { token: idToken } = jwt.generateToken(
          {
            firstName,
            lastName,
            fullName,
            language,
            aud: clientId,
          },
          ID_TOKEN_EXPIRES_IN
        );

        const { accessToken, refreshToken, refreshTokenId, exp } =
          jwt.generateAuthTokens({
            sub: id,
            aud: clientId,
            lng: language,
          });

        // refresh token rotation
        await store.set({
          key: `${clientId}:${id}`,
          value: refreshTokenId,
          expiresIn: exp,
        });

        return Ok({
          message: t(WELCOME_BACK, { firstName }),
          idToken,
          accessToken,
          refreshToken,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return BadRequest({
            message: t(e.message),
            code: e.code,
          });
        }
        throw e;
      }
    },
  },
};
