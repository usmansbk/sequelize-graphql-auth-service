import dayjs from "~utils/dayjs";
import TokenError from "~utils/errors/TokenError";
import { TOKEN_INVALID_ERROR } from "~helpers/constants/responseCodes";

const refreshTokenController = async (req, res) => {
  const { authorization, refresh_token: rfToken } = req.headers;
  const {
    context: { cache, jwt, db, clientId },
    t,
  } = req;

  try {
    const { sub } = jwt.decode(authorization);
    const decodedRefreshToken = jwt.verify(rfToken, { clientId }); // this will throw an error if invalid

    const key = `${clientId}:${sub}`;
    const jti = await cache.get(key);

    if (decodedRefreshToken.jti !== jti) {
      throw new TokenError(TOKEN_INVALID_ERROR);
    }

    await db.User.update(
      {
        lastLogin: dayjs.utc().toDate(),
      },
      {
        where: {
          id: sub,
        },
      }
    );

    const { accessToken, refreshToken, exp, sid } = await jwt.getAuthTokens(
      sub,
      { clientId }
    );

    await cache.set(`${clientId}:${sub}`, sid, exp);

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
