const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const requireAuth = async (req, res, next) => { // 👈 "rquireAuth" → "requireAuth"
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    jwt.verify(token, "mySecretKey", async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      } else {
        const user = await userModel.findById(decodedToken.id).select("-password"); // 👈 sécurité
        console.log("user from auth middleware:", user);
        if (!user) {
          return res.status(401).json({ error: "Unauthorized: User not found" });
        }
        req.user = user;
        next();
      }
    });
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = { requireAuth };