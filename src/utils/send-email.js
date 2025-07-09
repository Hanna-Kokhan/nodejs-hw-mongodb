import { createTransport } from 'nodemailer';
import { getEnvVar } from './getEnvVar.js';
import createHttpError from 'http-errors';

const mailClient = createTransport({
  host: getEnvVar('SMTP_HOST'),
  port: Number(getEnvVar('SMTP_PORT')),
  auth: {
    user: getEnvVar('SMTP_USER'),
    pass: getEnvVar('SMTP_PASSWORD'),
  },
});

export const sendEmail = async ({ email, html, subject }) => {
  try {
    await mailClient.sendMail({
      from: getEnvVar('SMTP_FROM'),
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error(error);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
