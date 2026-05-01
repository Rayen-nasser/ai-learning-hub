/**
 * Global error handling middleware.
 */

const { sendError } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Handle specific Mongoose errors
  if (err.name === "ValidationError") {
    return sendError(res, "Validation Error", 400, Object.values(err.errors).map(e => e.message));
  }

  if (err.code === 11000) {
    return sendError(res, "Duplicate Field Value", 400, err.keyValue);
  }

  if (err.name === "CastError") {
    return sendError(res, `Invalid format for ${err.path}: ${err.value}`, 400);
  }

  // Joi validation errors
  if (err.isJoi) {
    return sendError(res, "Invalid input data", 400, err.details.map(d => d.message));
  }

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === "development" ? { stack: err.stack } : null
  );
};

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
