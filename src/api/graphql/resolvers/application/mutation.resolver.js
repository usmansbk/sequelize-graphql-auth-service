import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import {
  APPLICATION_CREATED,
  APPLICATION_DELETED,
  APPLICATION_UPDATED,
} from "~helpers/constants/responseCodes";

export default {
  Mutation: {
    async createApplication(_parent, { input }, { dataSources, t }) {
      try {
        const application = await dataSources.applications.create(input);

        return Success({
          application,
          code: APPLICATION_CREATED,
          message: t(APPLICATION_CREATED),
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            errors: e.errors,
            code: e.code,
          });
        }
        throw e;
      }
    },
    async updateApplication(
      _parent,
      { input: { id, ...values } },
      { dataSources, t }
    ) {
      try {
        const application = await dataSources.applications.update(id, values);

        return Success({
          application,
          code: APPLICATION_UPDATED,
          message: t(APPLICATION_UPDATED),
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            errors: e.errors,
            code: e.code,
          });
        }
        throw e;
      }
    },
    async deleteApplication(_parent, { id }, { dataSources, t }) {
      try {
        await dataSources.applications.destroy(id);

        return Success({
          id,
          code: APPLICATION_DELETED,
          message: t(APPLICATION_DELETED),
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            errors: e.errors,
            code: e.code,
          });
        }
        throw e;
      }
    },
  },
};
