import jwt from "~utils/jwt";
import store from "~utils/store";

const login = async (user) => {
  const clientId = process.env.TEST_CLIENT_ID;
  const { accessToken, sid, exp } = jwt.generateAuthTokens({
    aud: clientId,
    sub: user.id,
  });
  await store.set({ key: `${clientId}:${user.id}`, value: sid });

  return { accessToken, clientId, exp };
};

export default { login };
