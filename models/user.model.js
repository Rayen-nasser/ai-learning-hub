const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    nom: String,
    prenom: String,
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: true,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number",
      ],
    },
    telephone: String,
    photodeprofil: String,
    role: {
      type: String,
      enum: ["user", "admin", "formateur", "responsableCF"],
      default: "user",
    },
    block: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },

    // ───── Champs Apprenant (role: user) ─────
    niveauEtude: {
      type: String,
      enum: ["primaire", "secondaire", "bac", "licence", "master", "doctorat"],
    },
    dateNaissance: { type: Date },
    adresse: { type: String },

    // ───── Champs Formateur (role: formateur) ─────
    specialite: String,
    experience: Number,
    statut: { type: String, enum: ["actif", "inactif"] },
    centreId: { type: mongoose.Schema.Types.ObjectId, ref: "CentreFormation" },

    // ───── Champs ResponsableCF (role: responsableCF) ─────
    centreGereId: { type: mongoose.Schema.Types.ObjectId, ref: "CentreFormation" },

    // ───── Champs Admin ─────
    // géré uniquement via le role, pas de champs supplémentaires
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);





/*
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({email}) 
  if (user){
    const auth = await bcrypt.compare(password, user.password)
    if (auth) {
      return user
    }
    throw new Error("invalid password")
  }
  throw new Error("incorrect email")
}  
*/