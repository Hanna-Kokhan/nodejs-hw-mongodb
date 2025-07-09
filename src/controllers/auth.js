import createHttpError from 'http-errors';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  requestResetPwdEmail,
  resetPassword,
} from '../services/auth.js';
import { THERTY_DAYS } from '../constants/index.js';

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THERTY_DAYS),
    path: '/',
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THERTY_DAYS),
    path: '/',
  });
};

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  setupSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};

export const refreshUserSessionController = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  if (!sessionId || !refreshToken) {
    throw createHttpError(401, 'Session ID or Refresh Token missing!');
  }

  const session = await refreshUserSession({ sessionId, refreshToken });

  setupSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: session.accessToken },
  });
};

export const logoutUserController = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await logoutUser(sessionId);
  }

  res.clearCookie('sessionId', {
    httpOnly: true,
    path: '/',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    path: '/',
  });

  res.status(204).send();
};

export const requestResetPwdEmailController = async (req, res) => {
  const { email } = req.body;

  await requestResetPwdEmail({ email });

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  const { token, password } = req.body;

  await resetPassword({ token, password });

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
