import { nanoid, customAlphabet } from "nanoid";
import { EMAIL_OTP_LENGTH, SMS_OTP_LENGTH } from "~constants/auth";

const getNumberCode = (size = SMS_OTP_LENGTH) => {
  const numid = customAlphabet("1234567890", size);
  return numid();
};

const getEmailOTP = (size = EMAIL_OTP_LENGTH) => nanoid(size);

export default {
  getNumberCode,
  getEmailOTP,
};
