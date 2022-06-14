import { SendRawEmailCommand } from "@aws-sdk/client-ses";
import Email from "email-templates";
import nodemailer from "nodemailer";
import log from "~utils/logger";
import { ses } from "./aws";
import Sentry from "./sentry";

const { NODE_ENV, MAIL_FROM } = process.env;

const env = NODE_ENV || "development";

const email = new Email({
  message: {
    from: MAIL_FROM,
  },
  transport: nodemailer.createTransport({
    SES: { ses, aws: { SendRawEmailCommand } },
  }),
  subjectPrefix: env === "development" && `[${env.toUpperCase()}] `,
  i18n: {
    locales: ["en"],
    directory: "./locales/emails",
  },
  send: true,
});

const sendEmail = async ({ template, message, locals }) => {
  if (env === "test") {
    return;
  }
  try {
    const info = await email.send({ template, message, locals });

    log.info(`Message sent: ${info.messageId}`);
  } catch (e) {
    log.error(e.message);
    Sentry.captureException(e);
  }
};

export default sendEmail;
