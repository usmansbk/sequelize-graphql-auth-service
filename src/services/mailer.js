import nodemailer from "nodemailer";
import aws from "@aws-sdk/client-ses";
import log from "~config/logger";

const { MAILER_FROM, MAILER_HOST_DEV, AWS_REGION } = process.env;

const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: AWS_REGION,
});

export default async function sendMail({ to, subject, text, html }) {
  try {
    let mailConfig;

    if (process.env.NODE_ENV === "production") {
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

    log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (e) {
    log.error(e);
  }
}
