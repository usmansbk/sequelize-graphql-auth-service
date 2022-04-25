import twilio from "twilio";
import log from "~utils/logger";
import Sentry from "./sentry";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const sendSMS = async (message, to) => {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  log.info(to, message);
  try {
    const client = twilio(accountSid, authToken);
    const response = await client.messages.create({
      body: message,
      from: process.env.PHONE_NUMBER,
      to,
    });

    log.info(response.sid);
  } catch (e) {
    Sentry.captureException(e);
  }
};

export default sendSMS;
