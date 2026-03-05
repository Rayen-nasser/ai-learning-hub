const mongoose = require("mongoose");

const formateurSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialite: {
      type: String,
      required: [true, "Spécialité est requise"],
    },
    biographie: {
      type: String,
      default: "",
    },
    experience: {
      type: String,
      default: "",
    },
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DirecteurCentreFormation",
      default: null,
    },
    dateRattachement: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Formateur", formateurSchema);