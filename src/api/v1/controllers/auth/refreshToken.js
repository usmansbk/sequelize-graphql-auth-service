import * as jwt from "~utils/jwt";
import store from "~utils/store";
import TokenError from "~utils/errors/TokenError";
import { TOKEN_INVALID_ERROR } from "~helpers/constants/i18n";

const refreshTokenController = async (req, res) => {
  const {
    authorization,
    refresh_token: rfToken,
    client_id: clientId,
  } = req.headers;

  try {
    const expiredToken = jwt.decode(authorization);
    const decodedRefreshToken = jwt.verify(rfToken); // this will throw an error if invalid

    const key = `${clientId}:${expiredToken.sub}`;
    const expectedJti = await store.get(key);

    if (decodedRefreshToken.jti !== expectedJti) {
      throw new TokenError(TOKEN_INVALID_ERROR);
    }

    const { accessToken, refreshToken, sid, exp } = jwt.generateAuthTokens({
      aud: clientId,
      sub: decodedRefreshToken.sub,
      lng: expiredToken.lng,
    });

    // rotate refresh token
    await store.set({
      key,
      value: sid,
      expiresIn: exp,
    });

    res.send({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (e) {
    res.status(401).send({
      success: false,
      message: req.t(e.message),
    });
  }
};

export default refreshTokenController;
