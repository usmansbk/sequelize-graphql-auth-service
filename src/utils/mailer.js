import sms from "~services/sms";
import email from "~services/email";

const mailer = {
  sendSMS: sms,
  sendEmail: email,
};

export default mailer;
