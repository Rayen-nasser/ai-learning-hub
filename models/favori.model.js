const mongoose = require("mongoose");

const favoriSchema = new mongoose.Schema(
  {
    apprenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cibleId: { type: mongoose.Schema.Types.ObjectId, required: true },
    typeCible: {
      type: String,
      enum: ["formation", "lecon", "centreFormation"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Favori", favoriSchema);
