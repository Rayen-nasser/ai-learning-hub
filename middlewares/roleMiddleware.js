const { requireAuth } = require("./authMiddleware");

const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
};

module.exports = { requireRole, requireAuth };
