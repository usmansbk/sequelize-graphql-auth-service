import { BadRequest, Ok } from "~helpers/response";
import { INVALID_OTP, PHONE_NUMBER_VERIFIED } from "~helpers/constants/i18n";
import QueryError from "~utils/errors/QueryError";
import { PHONE_NUMBER_KEY_PREFIX } from "~helpers/constants/tokens";

export default {
  Mutation: {
    async verifyPhoneNumber(_, { token }, { dataSources, store, userInfo, t }) {
      try {
        const { sub: id } = userInfo;
        const key = `${PHONE_NUMBER_KEY_PREFIX}:${id}`;

        const expectedToken = await store.get(key);

        if (token !== expectedToken) {
          throw new QueryError(INVALID_OTP);
        }

        const user = await dataSources.users.verifyPhoneNumber(id);

        await store.remove(key);

        return Ok({
          message: t(PHONE_NUMBER_VERIFIED),
          user,
        });
      } catch (error) {
        if (error instanceof QueryError) {
          return BadRequest({
            message: t(error.message),
          });
        }

        throw error;
      }
    },
  },
};
