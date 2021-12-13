import nodemailer from "nodemailer";
import * as aws from "@aws-sdk/client-ses";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import log from "~config/logger";

const { MAILER_FROM, MAILER_HOST_DEV, AWS_REGION, NODE_ENV } = process.env;

const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: AWS_REGION,
  defaultProvider,
});

export default async function sendMail({ to, subject, text, html }) {
  if (NODE_ENV === "test") {
    return;
  }

  try {
    let mailConfig;

    if (NODE_ENV === "production") {
      mailConfig = {
        SES: { ses, aws },
      };
    } else {
      const testAccount = await nodemailer.createTestAccount();
      mailConfig = {
        host: MAILER_HOST_DEV,
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      };
    }

    let transporter = nodemailer.createTransport(mailConfig);

    let info = await transporter.sendMail({
      from: MAILER_FROM,
      to,
      subject,
      text,
      html,
    });

    log.info(`Message sent: ${info.messageId}`);

    if (NODE_ENV === "development") {
      log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (e) {
    log.error(e.message);
  }
}
