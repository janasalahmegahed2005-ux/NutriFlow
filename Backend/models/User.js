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

    username: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^(?=.*[A-Za-z]).+$/,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    weight: {
      type: Number,
      required: true,
      min: 20,
      max: 300,
    },

    height: {
      type: Number,
      required: true,
      min: 100,
      max: 250,
    },

    goal: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
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

    imageUrl: {
      type: String,
      default: "/uploads/users/default-user.png",
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);