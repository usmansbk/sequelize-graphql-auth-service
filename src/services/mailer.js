import nodemailer from "nodemailer";
import log from "~config/logger";

const {
  MAILER_FROM,
  MAILER_HOST,
  MAILER_HOST_DEV,
  MAILER_USERNAME,
  MAILER_PASSWORD,
  MAILER_USERNAME_DEV,
  MAILER_PASSWORD_DEV,
} = process.env;

export default async function sendMail({ to, subject, text, html }) {
  try {
    let mailConfig;

    if (process.env.NODE_ENV === "production") {
      mailConfig = {
        host: MAILER_HOST,
        port: 587,
        secure: false,
        auth: {
          user: MAILER_USERNAME,
          pass: MAILER_PASSWORD,
        },
      };
    } else {
      mailConfig = {
        host: MAILER_HOST_DEV,
        port: 587,
        secure: false,
        auth: {
          user: MAILER_USERNAME_DEV,
          pass: MAILER_PASSWORD_DEV,
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
