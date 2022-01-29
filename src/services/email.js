import Email from "email-templates";
import nodemailer from "nodemailer";
import log from "~utils/logger";
import aws, { ses } from "./aws";

const { NODE_ENV, MAIL_FROM } = process.env;

const env = NODE_ENV || "development";

let transport;
const isProduction = env === "production";

if (isProduction) {
  transport = nodemailer.createTransport({
    SES: { ses, aws },
  });
} else {
  transport = {
    jsonTransport: true,
  };
}

const email = new Email({
  message: {
    from: MAIL_FROM,
  },
  transport,
  subjectPrefix: isProduction ? false : `[${env.toUpperCase()}] `,
  i18n: {
    locales: ["en"],
    directory: "./locales/emails",
  },
  // send: isProduction,
});

const sendEmail = async ({ template, message, locals }) => {
  try {
    const info = await email.send({ template, message, locals });

    if (env !== "test") {
      log.info(`Message sent: ${info.messageId}`);
    }
  } catch (e) {
    log.error(e.message);
  }
};

export default sendEmail;
