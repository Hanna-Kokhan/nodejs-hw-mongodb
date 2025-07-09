import Joi from 'joi';

const passwordJoiValidation = Joi.string()
  .min(12)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,}$/)
  .message({
    'string.pattern.base':
      'Password must include at least one uppercase letter, one lowercase letter, one digit, and one special character.',
  })
  .required();

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: passwordJoiValidation,
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().required(),
});

export const requestResetPwdValidationSchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
});

export const resetPasswordValidationSchema = Joi.object({
  token: Joi.string()
    .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
    .required(),
  password: passwordJoiValidation,
});

export const jwtTokenPayloadValidationSchema = Joi.object({
  sub: Joi.string().required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  iat: Joi.number(),
  exp: Joi.number(),
});
