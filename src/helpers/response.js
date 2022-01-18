import { FAIL, SUCCESS } from "./constants/i18n";

export const Success = ({ message = SUCCESS, ...payload }) => ({
  message,
  code: message,
  success: true,
  ...payload,
});

export const Fail = ({ message = FAIL, ...payload }) => ({
  message,
  code: message,
  success: false,
  ...payload,
});
