import verifyGoogleToken from "~services/googleOAuth";
import verifyFacebookToken from "~services/facebookOAuth";
import { FACEBOOK_PROVIDER, GOOGLE_PROVIDER } from "~helpers/constants/auth";

const verifySocialToken = async ({ provider, token }) => {
  let userInfo;
  switch (provider) {
    case GOOGLE_PROVIDER:
      userInfo = await verifyGoogleToken(token);
      break;
    case FACEBOOK_PROVIDER:
      userInfo = await verifyFacebookToken(token);
      break;
    default:
      break;
  }

  return userInfo;
};

export default verifySocialToken;
