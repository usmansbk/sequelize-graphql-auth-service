import Email from "email-templates";
import nodemailer from "nodemailer";
import * as aws from "@aws-sdk/client-ses";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import log from "~config/logger";
import { MAIL_FROM } from "~helpers/constants/emailTemplates";

const { AWS_REGION, NODE_ENV } = process.env;

const env = NODE_ENV || "development";

let transport;

if (env === "production") {
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
  subjectPrefix: env === "production" ? false : `[${env.toUpperCase()}] `,
  i18n: {
    locales: ["en"],
  },
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
