import MutationError from "~utils/errors/MutationError";

export default {
  Mutation: {
    async requestConfirmationEmail(_, { email }, { dataSources }) {
      try {
        const user = await dataSources.users.findOne({
          where: {
            email,
          },
        });

        return {
          success: true,
          message: `We've sent an email to "${email}" with further instructions.`,
        };
      } catch (e) {
        if (e instanceof MutationError) {
        } else {
          throw e;
        }
      }
    },
  },
};
