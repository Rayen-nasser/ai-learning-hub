const mongoose = require("mongoose");

const leconSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true },
    description: { type: String },
    duree: { type: Number, default: 0 }, // minutes par ex
    contenu: { type: String, required: true },

    cours: { type: mongoose.Schema.Types.ObjectId, ref: "Cours", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lecon", leconSchema);