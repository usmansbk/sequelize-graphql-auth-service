import TokenError from "~utils/errors/TokenError";
import { TOKEN_INVALID_ERROR } from "~constants/i18n";

const refreshTokenController = async (req, res) => {
  const {
    authorization,
    refresh_token: rfToken,
    client_id: clientId,
  } = req.headers;
  const {
    context: { cache, jwt },
    t,
  } = req;

  try {
    const expiredToken = jwt.decode(authorization);
    const decodedRefreshToken = jwt.verify(rfToken); // this will throw an error if invalid

    const key = `${clientId}:${expiredToken.sub}`;
    const expectedJti = await cache.get(key);

    if (decodedRefreshToken.jti !== expectedJti) {
      throw new TokenError(TOKEN_INVALID_ERROR);
    }

    const { accessToken, refreshToken } = await jwt.generateAuthTokens({
      aud: clientId,
      sub: decodedRefreshToken.sub,
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (e) {
    res.status(401).json({
      success: false,
      message: t(e.message),
    });
  }
};

export default refreshTokenController;
