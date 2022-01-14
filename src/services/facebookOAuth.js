import fetch from "node-fetch";
import { TOKEN_INVALID_ERROR } from "~helpers/constants/i18n";
import TokenError from "~utils/errors/TokenError";

const HOST_URL = "graph.facebook.com";
const fields = [
  "id",
  "first_name",
  "last_name",
  "short_name",
  "email",
  "picture{url}",
];

const verifyFacebookToken = async (accessToken) => {
  const req = `https://${HOST_URL}/me?fields=${fields.join(
    ","
  )}&access_token=${accessToken}`;
  const res = await fetch(req);
  const body = await res.json();
  if (body?.error) {
    throw new TokenError(TOKEN_INVALID_ERROR);
  }

  return {
    firstName: body.first_name,
    lastName: body.last_name,
    nickName: body.short_name,
    email: body.email,
    socialAvatarURL: body.picture?.data?.url,
    emailVerified: true,
  };
};

export default verifyFacebookToken;
