import QueryError from "~utils/errors/QueryError";
import { PROFILE_UPDATED } from "~helpers/constants/i18n";
import { BadRequest, Ok } from "~helpers/response";

export default {
  Mutation: {
    async updateProfile(_parent, { input }, { dataSources, t }) {
      try {
        const user = await dataSources.users.updateCurrentUser(input);

        return Ok({
          message: t(PROFILE_UPDATED),
          user,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return BadRequest({
            message: t(e.message),
            code: e.code,
            errors: e.errors,
          });
        }
        throw e;
      }
    },
  },
};
