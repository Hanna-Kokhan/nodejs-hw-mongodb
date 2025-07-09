import { createTransport } from 'nodemailer';
import { getEnvVar } from './getEnvVar.js';
import createHttpError from 'http-errors';
import { ENV_VARS } from '../constants/envVars.js';

const mailClient = createTransport({
  host: getEnvVar(ENV_VARS.SMTP_HOST),
  port: Number(getEnvVar(ENV_VARS.SMTP_PORT)),
  auth: {
    user: getEnvVar(ENV_VARS.SMTP_USER),
    pass: getEnvVar(ENV_VARS.SMTP_PASSWORD),
  },
});

export const sendEmail = async ({ email, html, subject }) => {
  try {
    await mailClient.sendMail({
      from: getEnvVar(ENV_VARS.SMTP_FROM),
      to: email,
      subject,
      html,
    });
  } catch (err) {
    console.error('Error sending email:', err);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
