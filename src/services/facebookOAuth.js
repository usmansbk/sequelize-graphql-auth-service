import fetch from "node-fetch";
import { TOKEN_INVALID_ERROR } from "~constants/i18n";
import TokenError from "~utils/errors/TokenError";

const FB_GRAPH_ENDPOINT = "https://graph.facebook.com";
const fields = [
  "id",
  "first_name",
  "last_name",
  "short_name",
  "email",
  "picture{url}",
];

const verifyToken = async (token) => {
  const response = await fetch(
    `${FB_GRAPH_ENDPOINT}/debug_token?input_token=${token}&access_token=${process.env.FACEBOOK_APP_ACCESS_TOKEN}`
  );
  const body = await response.json();
  if (!body.data.app_id !== process.env.FACEBOOK_APP_ID) {
    throw new TokenError(TOKEN_INVALID_ERROR);
  }
};

const verifyFacebookToken = async (accessToken) => {
  await verifyToken(accessToken);
  const query = `${FB_GRAPH_ENDPOINT}/me?fields=${fields.join(
    ","
  )}&access_token=${accessToken}`;
  const response = await fetch(query);
  const body = await response.json();
  if (body?.error) {
    throw new TokenError(TOKEN_INVALID_ERROR, new Error(body.error.message));
  }

  return {
    firstName: body.first_name,
    lastName: body.last_name,
    email: body.email,
    socialAvatarURL: body.picture?.data?.url,
    emailVerified: true,
  };
};

export default verifyFacebookToken;
