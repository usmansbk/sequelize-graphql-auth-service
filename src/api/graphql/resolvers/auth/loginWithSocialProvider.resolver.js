import verifyGoogleToken from "~services/googleOAuth";
import { GOOGLE_PROVIDER } from "~helpers/constants/providers";

export default {
  Mutation: {
    async loginWithSocialProvider(_parent, { input: { provider, token } }) {
      let userInfo;
      switch (provider) {
        case GOOGLE_PROVIDER:
          userInfo = await verifyGoogleToken(token);
          break;
        default:
          break;
      }

      return {
        success: true,
        user: userInfo,
      };
    },
  },
};
