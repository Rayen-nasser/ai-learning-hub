const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    niveau: {
      type: String,
      enum: ["superadmin", "admin", "moderateur"],
      default: "admin",
    },
    permissions: {
      type: [String],
      default: ["read", "write", "delete"],
    },
    derniereConnexion: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);