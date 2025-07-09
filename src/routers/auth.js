import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import {
  registerUserSchema,
  loginUserSchema,
  requestResetPwdValidationSchema,
  resetPasswordValidationSchema,
} from '../validation/auth.js';
import {
  registerUserController,
  loginUserController,
  refreshUserSessionController,
  logoutUserController,
  requestResetPwdEmailController,
  resetPasswordController,
} from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);

router.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);

router.post('/refresh', ctrlWrapper(refreshUserSessionController));

router.post('/logout', ctrlWrapper(logoutUserController));

router.post(
  '/send-reset-email',
  validateBody(requestResetPwdValidationSchema),
  ctrlWrapper(requestResetPwdEmailController),
);

router.post(
  '/reset-pwd',
  validateBody(resetPasswordValidationSchema),
  ctrlWrapper(resetPasswordController),
);

export default router;
