const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const requireAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }
      if (decodedToken.type === "password-reset") {
        return res.status(401).json({ error: "Unauthorized: Invalid token type" });
      }
      
      let user = await userModel.findById(decodedToken.id)
        .select("-password -loginAttempts")
        .populate({ path: "centreIds", model: "CentreFormation" });
        
      if (!user) {
        return res.status(401).json({ error: "Unauthorized: User not found" });
      }

      if (user.blockExpiresAt && new Date() > user.blockExpiresAt) {
        await userModel.findByIdAndUpdate(user._id, {
          block: false,
          blockReason: null,
          blockedAt: null,
          blockedBy: null,
          blockExpiresAt: null,
        });
        user.block = false;
      }

      if (user.block) {
        let message = "Your account has been blocked.";
        if (user.blockReason) {
          message += ` Reason: ${user.blockReason}`;
        }
        if (user.blockExpiresAt) {
          message += ` Blocked until ${user.blockExpiresAt.toISOString().split('T')[0]}`;
        }
        return res.status(403).json({ error: message });
      }

      req.user = user;
      next();
    });
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = { requireAuth };
