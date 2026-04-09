const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const baseUserSchema = new mongoose.Schema(
  {
    nom: { type: String },
    prenom: { type: String },
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
        "Password must contain at least 8 characters, one uppercase, one lowercase, and one number",
      ],
    },
    telephone: { type: String },
    user_image: { type: String },
    block: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
    discriminatorKey: "role",
  }
);

baseUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

baseUserSchema.statics.login = async function (email, password) {
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

  await this.findByIdAndUpdate(user._id, { loginAttempts: 0 });
  return user;
};

baseUserSchema.statics.register = async function (userData) {
  const user = new this(userData);
  await user.save();
  return user;
};

const User = mongoose.model("User", baseUserSchema);

const ApprenantSchema = new mongoose.Schema({
  niveauEtude: {
    type: String,
    enum: ["primaire", "secondaire", "bac", "licence", "master", "doctorat"],
  },
  dateNaissance: { type: Date },
  adresse: { type: String },
});

const FormateurSchema = new mongoose.Schema({
  specialite: { type: String },
  experience: { type: Number },
  statut: { type: String, enum: ["actif", "inactif"], default: "actif" },
  centreId: { type: mongoose.Schema.Types.ObjectId, ref: "CentreFormation" },
});

const ResponsableCFSchema = new mongoose.Schema({
  centreGereId: { type: mongoose.Schema.Types.ObjectId, ref: "CentreFormation" },
});

const AdminSchema = new mongoose.Schema({});

User.discriminator("apprenant", ApprenantSchema);
User.discriminator("formateur", FormateurSchema);
User.discriminator("responsableCF", ResponsableCFSchema);
User.discriminator("admin", AdminSchema);

module.exports = User;
