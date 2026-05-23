/**
 * Centralized configuration for environment variables with defaults.
 */
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongoUri: process.env.url_Mongodb || 'mongodb://localhost:27017/formation_db',
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    fromName: process.env.EMAIL_FROM_NAME || 'Formation Center',
  },
  
  // Rate limiting config
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  },

  // Unified creation fee applied to all training centers upon approval (configurable via .env)
  creationFee: parseInt(process.env.CENTER_CREATION_FEE) || 1000,
};

module.exports = config;
