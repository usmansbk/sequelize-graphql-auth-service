import { Fail, Success } from "~helpers/response";
import { INVALID_OTP, PHONE_NUMBER_VERIFIED } from "~helpers/constants/i18n";
import QueryError from "~utils/errors/QueryError";
import { PHONE_NUMBER_KEY_PREFIX } from "~helpers/constants/auth";

export default {
  Mutation: {
    async verifyPhoneNumber(
      _parent,
      { token },
      { dataSources, store, tokenInfo, t }
    ) {
      try {
        const { sub: id } = tokenInfo;
        const key = `${PHONE_NUMBER_KEY_PREFIX}:${id}`;

        const expectedToken = await store.get(key);

        if (token !== expectedToken) {
          throw new QueryError(INVALID_OTP);
        }

        const user = await dataSources.users.verifyPhoneNumber(id);

        await store.remove(key);

        return Success({
          message: t(PHONE_NUMBER_VERIFIED),
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
