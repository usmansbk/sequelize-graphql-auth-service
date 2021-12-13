import nodemailer from "nodemailer";
import log from "~config/logger";

export default async function sendMail({ to, subject, text, html }) {
  try {
    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
      host: process.env.MAILER_HOST,
      port: process.env.MAILER_PORT,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    let info = await transporter.sendMail({
      from: process.env.MAILER_FROM,
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
