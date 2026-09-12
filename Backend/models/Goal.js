const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["lose", "maintain", "gain"],
      required: true,
    },

    targetWeight: {
      type: Number,
      required: true,
      min: 1,
    },

    dailyCalories: {
      type: Number,
      required: true,
      min: 1,
    },

    proteinTarget: {
      type: Number,
      required: true,
      min: 0,
    },

    carbsTarget: {
      type: Number,
      required: true,
      min: 0,
    },

    fatTarget: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Goal", goalSchema);