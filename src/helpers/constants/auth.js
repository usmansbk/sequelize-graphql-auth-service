import dayjs from "~utils/dayjs";

// expiresIn is expressed in seconds or a string describing a time span https://github.com/zeit/ms
export const ID_TOKEN_EXPIRES_IN = "30 minutes";
export const ACCESS_TOKEN_EXPIRES_IN = "15 days";
export const REFRESH_TOKEN_EXPIRES_IN = "14 days";
export const RESET_PASSWORD_TOKEN_EXPIRES_IN = "20 minutes";
export const DELETE_ACCOUNT_TOKEN_EXPIRES_IN = "5 minutes";
export const EMAIL_VERIFICATION_TOKEN_EXPIRES_IN = "10 hours";

// opt is expressed in dayjs duration (in minutes) format
export const EMAIL_OTP_EXPIRES_IN = dayjs.duration(5, "minutes").asSeconds();
export const SMS_OTP_EXPIRES_IN = dayjs.duration(5, "minutes").asSeconds();

export const SMS_OTP_LENGTH = 6;
export const EMAIL_OTP_LENGTH = 8;

export const PASSWORD_KEY_PREFIX = "password";
export const EMAIL_VERIFICATION_KEY_PREFIX = "email:verification";
export const EMAIL_OTP_KEY_PREFIX = "email:otp";
export const PHONE_NUMBER_KEY_PREFIX = "phoneNumber";
export const DELETE_ACCOUNT_KEY_PREFIX = "account:delete";

export const GOOGLE_PROVIDER = "GOOGLE";
export const FACEBOOK_PROVIDER = "FACEBOOK";

export const allowedClients = [process.env.TEST_CLIENT_ID];
