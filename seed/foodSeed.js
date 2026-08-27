const mongoose = require("mongoose");
require("dotenv").config();

const Food = require("../models/Food");

const foods = [
  {
    name: "Chicken Breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    vitamins: ["Vitamin B6", "Vitamin B12"],
  },

  {
    name: "Brown Rice",
    calories: 123,
    protein: 2.7,
    carbs: 25.6,
    fat: 1,
    fiber: 1.6,
    vitamins: ["Vitamin B1", "Vitamin B3", "Magnesium"],
  },

  {
    name: "Egg",
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    vitamins: ["Vitamin A", "Vitamin B12", "Vitamin D"],
  },

  {
    name: "Banana",
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    fiber: 2.6,
    vitamins: ["Vitamin C", "Vitamin B6", "Potassium"],
  },

  {
    name: "Apple",
    calories: 52,
    protein: 0.3,
    carbs: 13.8,
    fat: 0.2,
    fiber: 2.4,
    vitamins: ["Vitamin C"],
  },

  {
    name: "Greek Yogurt",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0,
    vitamins: ["Calcium", "Vitamin B12"],
  },

  {
    name: "Avocado",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    vitamins: ["Vitamin K", "Vitamin E", "Vitamin C"],
  },

  {
    name: "Oats",
    calories: 389,
    protein: 16.9,
    carbs: 66.3,
    fat: 6.9,
    fiber: 10.6,
    vitamins: ["Vitamin B1", "Iron", "Magnesium"],
  },

  {
    name: "Salmon",
    calories: 208,
    protein: 20.4,
    carbs: 0,
    fat: 13.4,
    fiber: 0,
    vitamins: ["Vitamin D", "Vitamin B12", "Omega-3"],
  },

  {
    name: "Broccoli",
    calories: 34,
    protein: 2.8,
    carbs: 6.6,
    fat: 0.4,
    fiber: 2.6,
    vitamins: ["Vitamin C", "Vitamin K", "Folate"],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas connected!");

    await Food.deleteMany();

    await Food.insertMany(foods);

    console.log("Foods inserted successfully!");

    await mongoose.connection.close();

    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error seeding database:", error.message);
  }
};

seedDatabase();