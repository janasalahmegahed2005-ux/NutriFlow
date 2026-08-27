const mongoose = require("mongoose");

const lifestyleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
    },

    activityMinutes: {
      type: Number,
      min: 0,
      max: 1440,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lifestyle", lifestyleSchema);