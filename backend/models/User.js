const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema(
  {
    name: { type: "String", required: true },
    email: { type: "String", unique: true, required: true },
    password: { type: "String", required: true },
    profilePic: {
      type: "String",
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestaps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        // Payload
        userId: this._id.toString(),
        email: this.email,
      },
      // Signature
      process.env.JWT_SECRET, // SECRET_KEY is accessed from the .env file
      {
        expiresIn: "30d",
      }
    ); // SECRET_KEY is accessed from the .env file
  } catch (err) {
    console.log(err);
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
