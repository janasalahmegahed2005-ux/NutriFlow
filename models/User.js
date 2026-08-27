const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      match: /^[A-Za-z]+$/,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      match: /^[A-Za-z]+$/,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    role: {
  type: String,
  enum: ["user", "admin"],
  default: "user",
},

   password: {
  type: String,
  required: true,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);