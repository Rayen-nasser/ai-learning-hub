const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: String,
    prenom: String,
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number",
      ],
    },
    age: { type: Number, min: 20, max: 80 },
    role: { type: String, enum: ["admin", "apprenant", "formateur"], default: "apprenant" },
    location: String,
    photo : String,


    //champs role admin
    tel:Number,

    //champs roley
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});


module.exports = mongoose.model("User", userSchema);

  
