import { nanoid, customAlphabet } from "nanoid";
import { EMAIL_OTP_LENGTH, SMS_OTP_LENGTH } from "~helpers/constants/auth";

export const getSmsOtp = (size = SMS_OTP_LENGTH) => {
  const numid = customAlphabet("1234567890", size);
  return numid();
};

export const getEmailOtp = (size = EMAIL_OTP_LENGTH) => nanoid(size);
