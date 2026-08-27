const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    food: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Food",
  required: false,
},

quantity: {
  type: Number,
  required: false,
  min: 0,
},

    mealType: {
      type: String,
      required: true,
      enum: ["breakfast", "lunch", "dinner", "snack"],
    },

    calories: {
      type: Number,
      required: true,
      min: 0,
    },

    protein: {
      type: Number,
      required: true,
      min: 0,
    },

    carbs: {
      type: Number,
      required: true,
      min: 0,
    },

    fat: {
      type: Number,
      required: true,
      min: 0,
    },

    fiber: {
      type: Number,
      required: true,
      min: 0,
    },

    vitamins: {
      type: [String],
      default: [],
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Meal", mealSchema);
