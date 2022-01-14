import * as jwt from "~utils/jwt";

const refreshToken = (req, res) => {
  const {
    authorization,
    refresh_token: rfToken,
    client_id: clientId,
  } = req.headers;

  const decoded = jwt.verify(rfToken);

  console.log(authorization, decoded, clientId);

  res.send({
    success: true,
  });
};

export default {
  refreshToken,
};
