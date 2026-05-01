const mongoose = require("mongoose");

const formationSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true },
    description: { type: String },
    prix: { type: Number },
    centreId: { type: mongoose.Schema.Types.ObjectId, ref: "CentreFormation" },
    categorieId: { type: mongoose.Schema.Types.ObjectId, ref: "Categorie" },
    duree: { type: Number },
    image: { type: String },
    formateurIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    requiredSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Formation", formationSchema);