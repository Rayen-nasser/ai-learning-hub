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
    role: {
      type: String,
      enum: ["apprenant", "formateur", "responsableCF", "admin"],
      default: "apprenant",
    },
    telephone: String,
    user_image: String,
    block: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // ───── Champs Apprenant ─────
    niveauEtude: {
      type: String,
      enum: [null, "", "primaire", "secondaire", "bac", "licence", "master", "doctorat"],
    },
    dateNaissance: { type: Date },
    adresse: { type: String },

    // ───── Champs Formateur ─────
    specialite: String,
    experience: Number,
    statut: { type: String, enum: [null, "", "actif", "inactif"] },
    centreIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "CentreFormation" }],

    // ───── Champs ResponsableCF ─────
    // Centers managed by this responsableCF are queried via CentreFormation.responsableId

    // ───── Champs Admin ─────
    // géré uniquement via le role
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.statics.login = async function (email, password) {
  try {
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error("Incorrect email");
    }

    if (user.block === true) {
      throw new Error("User is blocked");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const updatedUser = await this.findByIdAndUpdate(
        user._id,
        { $inc: { loginAttempts: 1 } },
        { new: true }
      );
      if (updatedUser.loginAttempts >= 5) {
        await this.findByIdAndUpdate(user._id, { block: true });
        throw new Error("User is blocked due to too many failed login attempts");
      }
      throw new Error("Incorrect password");
    }

    const updatedUser = await this.findByIdAndUpdate(
      user._id,
      { loginAttempts: 0 },
      { new: true }
    );

    return updatedUser;
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model("User", userSchema);