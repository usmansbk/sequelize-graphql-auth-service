import Email from "email-templates";
import nodemailer from "nodemailer";
import aws from "aws-sdk";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import log from "~utils/logger";

const { NODE_ENV, MAIL_FROM, AWS_REGION } = process.env;

const env = NODE_ENV || "development";

let transport;
const isProduction = env === "production";

if (isProduction) {
  const ses = new aws.SES({
    apiVersion: "2010-12-01",
    region: AWS_REGION,
    defaultProvider,
  });

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
  },
  send: isProduction,
});

export default async function sendMail({ template, message, locals }) {
  try {
    const info = await email.send({ template, message, locals });

    if (env !== "test") {
      log.info(`Message sent: ${info.messageId}`);
    }
  } catch (e) {
    log.error(e.message);
  }
}
