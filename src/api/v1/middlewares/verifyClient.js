import { AuthenticationError } from "apollo-server-core";
import { INVALID_CLIENT_ID } from "~helpers/constants/responseCodes";

const verifyClient = (req, _res, next) => {
  const {
    context: { clientId, clients },
  } = req;
  if (!clients.includes(clientId)) {
    return next(new AuthenticationError(INVALID_CLIENT_ID));
  }
  return next();
};

export default verifyClient;
