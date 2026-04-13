const mongoose = require("mongoose");

const categorieSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Categorie", categorieSchema);