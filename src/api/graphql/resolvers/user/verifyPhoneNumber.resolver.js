import { Fail, Success } from "~helpers/response";
import { INVALID_OTP, PHONE_NUMBER_VERIFIED } from "~constants/i18n";
import QueryError from "~utils/errors/QueryError";
import { PHONE_NUMBER_KEY_PREFIX } from "~constants/auth";

export default {
  Mutation: {
    async verifyPhoneNumber(
      _parent,
      { token },
      { dataSources, store, tokenInfo, t }
    ) {
      try {
        const { sub } = tokenInfo;
        const key = `${PHONE_NUMBER_KEY_PREFIX}:${sub}`;

        const expectedToken = await store.get(key);

        if (token !== expectedToken) {
          throw new QueryError(INVALID_OTP);
        }

        const user = await dataSources.users.update(sub, {
          phoneNumberVerified: true,
        });

        await store.remove(key);

        return Success({
          message: t(PHONE_NUMBER_VERIFIED),
          code: PHONE_NUMBER_VERIFIED,
          user,
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
