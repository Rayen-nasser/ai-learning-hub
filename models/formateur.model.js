const mongoose = require("mongoose");
const User = require("./user.model");

const formateurSchema = new mongoose.Schema({
  // champs spécifiques formateur si besoin (optionnel)
  // ex: bio: String, specialite: String
});

module.exports = User.discriminator("formateur", formateurSchema);