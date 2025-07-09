import { UserCollection } from '../db/models/user.js';
import { SessionCollection } from '../db/models/session.js';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';
import { FIFTEEN_MINUTES, THERTY_DAYS } from '../constants/index.js';
import { sendEmail } from '../utils/send-email.js';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import { ENV_VARS } from '../constants/envVars.js';
import Handlebars from 'handlebars';
import fs from 'node:fs';
import path from 'node:path';
import { TEMPLATE_DIR } from '../constants/paths.js';
import { jwtTokenPayloadValidationSchema } from '../validation/auth.js';

export const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THERTY_DAYS),
  };
};

export const registerUser = async (payload) => {
  const { email, password } = payload;

  const userExists = await UserCollection.findOne({ email });
  if (userExists) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UserCollection.create({
    ...payload,
    password: hashedPassword,
  });

  return newUser;
};

export const loginUser = async ({ email, password }) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials!');
  }

  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    throw createHttpError(401, 'Invalid credentials!');
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const newSessionData = createSession();

  const session = await SessionCollection.create({
    userId: user._id,
    ...newSessionData,
  });

  return session;
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found!');
  }

  const isRefreshTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isRefreshTokenExpired) {
    await SessionCollection.deleteOne({ _id: sessionId });
    throw createHttpError(401, 'Session token expired!');
  }

  await SessionCollection.deleteOne({ _id: sessionId });

  const newSessionData = createSession();

  const createdSession = await SessionCollection.create({
    userId: session.userId,
    ...newSessionData,
  });

  return createdSession;
};

export const logoutUser = async (sessionId) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};

const resetPasswordEmailTemplate = fs
  .readFileSync(path.join(TEMPLATE_DIR, 'reset-password-email-template.html'))
  .toString('utf8');

export const requestResetPwdEmail = async ({ email }) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    return;
  }

  const token = jwt.sign(
    {
      sub: user._id.toString(),
      email,
    },
    getEnvVar(ENV_VARS.JWT_SECRET),
    {
      expiresIn: '5m',
    },
  );

  const template = Handlebars.compile(resetPasswordEmailTemplate);

  const html = template({
    name: user.name,
    link: `${getEnvVar(ENV_VARS.APP_DOMAIN)}/reset-password?token=${token}`,
  });

  const subject = 'Reset your password';

  await sendEmail({ email, html, subject });
};

export const resetPassword = async ({ token, password }) => {
  let payload;
  try {
    payload = jwt.verify(token, getEnvVar(ENV_VARS.JWT_SECRET));

    const { error } = jwtTokenPayloadValidationSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw new Error(`Payload validation error: ${error.message}`);
    }
  } catch (error) {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await UserCollection.findOne({
    _id: payload.sub,
    email: payload.email,
  });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await UserCollection.updateOne(
    { _id: user._id },
    { password: hashedPassword },
  );

  await SessionCollection.deleteMany({ userId: user._id });
};
