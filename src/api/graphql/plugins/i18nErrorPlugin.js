/**
 * This plugin translates the errors to the client request language
 */
const i18nErrorPlugin = {
  async requestDidStart() {
    return {
      async didEncounterErrors(requestContext) {
        const { errors, context } = requestContext;
        errors.forEach((e) => {
          e.message = context.t(e.message);
        });
      },
    };
  },
};

export default i18nErrorPlugin;
