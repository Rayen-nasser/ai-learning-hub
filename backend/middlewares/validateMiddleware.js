/**
 * Middleware to validate request body using Joi schemas.
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorDetails = error.details.map(detail => detail.message);
    const err = new Error("Validation Error");
    err.status = 400;
    err.isJoi = true;
    err.details = error.details;
    return next(err);
  }
  
  next();
};

module.exports = validate;
