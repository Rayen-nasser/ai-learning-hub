const { requireAuth } = require("./authMiddleware");

const requireRole = (...args) => {
  const allowedRoles = args.flat();
  return async (req, res, next) => {
    try {
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
    } catch (error) {
      res.status(401).json({ error: error.message || "Unauthorized" });
    }
  };
};

module.exports = { requireRole, requireAuth };
