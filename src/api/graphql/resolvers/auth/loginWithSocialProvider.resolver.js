import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { WELCOME_BACK, WELCOME_NEW_USER } from "~constants/i18n";
import { ACCOUNT_STATUS } from "~constants/models";

export default {
  Mutation: {
    async loginWithSocialProvider(
      _parent,
      { input },
      { t, dataSources, jwt, clientId, store }
    ) {
      try {
        const userInfo = await jwt.verifySocialToken(input);
        const [user, created] = await dataSources.users.findOrCreate({
          ...userInfo,
          status: ACCOUNT_STATUS.ACTIVE,
        });
        const { id, firstName } = user;

        const { accessToken, refreshToken, sid, exp } = jwt.generateAuthTokens({
          sub: id,
          aud: clientId,
        });

        // refresh token rotation
        await store.set({
          key: `${clientId}:${id}`,
          value: sid,
          expiresIn: exp,
        });

        const code = created ? WELCOME_NEW_USER : WELCOME_BACK;
        return Success({
          message: t(code, { firstName }),
          code,
          accessToken,
          refreshToken,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
          });
        }
        throw e;
      }
    },
  },
};
