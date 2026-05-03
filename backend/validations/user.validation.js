const Joi = require('joi');

const userSchema = Joi.object({
  nom: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name cannot exceed 50 characters'
  }),
  prenom: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name cannot exceed 50 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base': 'Password must contain one uppercase letter, one lowercase letter, and one number',
    'any.required': 'Password is required'
  }),
  telephone: Joi.string().regex(/^(?:\+216|00216)?[ ]?[24579][0-9]{7}$/).allow('', null).messages({
    'string.pattern.base': 'Invalid Tunisian phone number format (e.g., 21666777 or +216 21666777)'
  }),
  dateNaissance: Joi.date().less('now').max('now').allow('', null).messages({
    'date.base': 'Invalid date format',
    'date.less': 'Birth date must be in the past',
    'date.max': 'Birth date must be in the past'
  }),
  role: Joi.string().valid('apprenant', 'formateur', 'responsableCF', 'admin').messages({
    'any.only': 'Invalid role'
  }),
  niveauEtude: Joi.string().valid('primaire', 'secondaire', 'bac', 'licence', 'master', 'doctorat', '', null).messages({
    'any.only': 'Invalid education level'
  }),
  experience: Joi.number().min(0).allow('', null).messages({
    'number.min': 'Experience cannot be negative'
  })
}).unknown(true);

const validateUser = (data) => {
  return userSchema.validate(data, { abortEarly: false });
};

const validateUserUpdate = (data) => {
  // Make all fields optional for updates
  const updateSchema = userSchema.fork(Object.keys(userSchema.describe().keys), (schema) => schema.optional());
  return updateSchema.validate(data, { abortEarly: false });
};

module.exports = { validateUser, validateUserUpdate };
