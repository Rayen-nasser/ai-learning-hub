const mongoose = require("mongoose");

const leconSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true },
    description: { type: String },
    contenu: { type: String },
    duree: { type: String },
    formationId: { type: mongoose.Schema.Types.ObjectId, ref: "Formation" },
    formateurId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    estAccessible: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lecon", leconSchema);
