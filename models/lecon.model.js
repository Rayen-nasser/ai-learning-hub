const mongoose = require("mongoose");

const leconSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, "Titre est requis"],
      trim: true,
    },
    contenu: {
      type: String,
      default: "",
    },
    ordre: {
      type: Number,
      required: [true, "Ordre est requis"],
      min: 1,
    },
    coursId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cours",
      required: true,
    },
    formateurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Formateur",
      required: true,
    },
    duree: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lecon", leconSchema);