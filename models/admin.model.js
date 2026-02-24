const mongoose = require("mongoose");
const User = require("./user.model");

const adminSchema = new mongoose.Schema({
  // champs spécifiques admin si besoin (optionnel)
  // ex: permissions: [String]
});

module.exports = User.discriminator("admin", adminSchema);