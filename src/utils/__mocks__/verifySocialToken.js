import { TOKEN_INVALID_ERROR } from "~helpers/constants/i18n";
import TokenError from "~utils/errors/TokenError";

const verifySocialToken = async ({ token }) => {
  if (token === "invalid") {
    throw new TokenError(TOKEN_INVALID_ERROR);
  }

  return {
    email: "test@gmail.com",
    firstName: "Usman",
    lastName: "Babakolo",
  };
};

export default verifySocialToken;
