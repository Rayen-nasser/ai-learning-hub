
const mongoose = require("mongoose");
const User = require("./user.model");

const learnerSchema = new mongoose.Schema({
  // champs spécifiques apprenant si besoin (optionnel)
  // ex: niveau: String
});

module.exports = User.discriminator("apprenant", learnerSchema);