import jwt from "~utils/jwt";
import store from "~utils/store";

const login = async (user) => {
  const clientId = "test";
  const { accessToken, sid } = jwt.generateAuthTokens({
    aud: clientId,
    sub: user.id,
  });
  await store.set({ key: `${clientId}:${user.id}`, value: sid });

  return { accessToken, clientId };
};

export default { login };
