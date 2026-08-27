const mongoose = require("mongoose");

const nutritionProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    age: {
      type: Number,
      required: true,
      min: 13,
      max: 120,
    },


   gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
   },

    height: {
      type: Number,
      required: true,
      min: 50,
      max: 250,
    },

    weight: {
      type: Number,
      required: true,
      min: 20,
      max: 500,
    },

    activityLevel: {
      type: String,
      required: true,
      enum: [
        "sedentary",
        "light",
        "moderate",
        "active",
        "very_active",
      ],
    },

    goal: {
      type: String,
      required: true,
      enum: ["lose_weight", "maintain_weight", "gain_weight"],
    },

    dailyCalories: {
      type: Number,
      required: true,
      min: 0,
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

    fiberTarget: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "NutritionProfile",
  nutritionProfileSchema
);