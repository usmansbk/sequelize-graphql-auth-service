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
    const expiredToken = jwt.decode(authorization);
    const decodedRefreshToken = jwt.verify(rfToken); // this will throw an error if invalid

    const key = `${clientId}:${expiredToken.sub}`;
    const expectedJti = await cache.get(key);

    if (decodedRefreshToken.jti !== expectedJti) {
      throw new TokenError(TOKEN_INVALID_ERROR);
    }

    const user = await db.User.update(
      {
        lastLogin: dayjs.utc().toDate(),
      },
      {
        where: {
          id: expiredToken.sub,
        },
      }
    );

    const { accessToken, refreshToken, exp, sid } =
      await jwt.generateAuthTokens({
        sub: user.id,
      });

    await cache.set(`${clientId}:${user.id}`, sid, exp);

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
