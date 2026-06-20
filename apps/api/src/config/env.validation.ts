import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required().messages({
    'any.required': '❌ Помилка: Змінна DATABASE_URL обовʼязкова!',
  }),
  JWT_SECRET: Joi.string().required().messages({
    'any.required': '❌ Помилка: Змінна JWT_SECRET обовʼязкова!',
  }),
  MAILGUN_API_KEY: Joi.string().required().messages({
    'any.required': '❌ Помилка: Змінна MAILGUN_API_KEY обовʼязкова для розсилки інвайтів!',
  }),
  ADMIN_EMAIL: Joi.string().email().required().messages({
    'any.required': '❌ Помилка: Змінна ADMIN_EMAIL обовʼязкова для створення дефолтного адміна!',
    'string.email': '❌ Помилка: ADMIN_EMAIL повинен бути валідним email-ом!',
  }),
  ADMIN_PASSWORD: Joi.string().min(6).required().messages({
    'any.required': '❌ Помилка: Змінна ADMIN_PASSWORD обовʼязкова!',
    'string.min': '❌ Помилка: Пароль адміна повинен бути не менше 6 символів!',
  }),
});