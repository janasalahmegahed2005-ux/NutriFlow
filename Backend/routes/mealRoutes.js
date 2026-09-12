const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  validateMeal,
  handleValidationErrors,
} = require("../middleware/validationMiddleware");

const {
  createMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal,
} = require("../controllers/mealController");

const router = express.Router();


// ==========================================
// CREATE A NEW MEAL
// Protected route
// ==========================================
router.post(
  "/",
  protect,
  ...validateMeal,
  handleValidationErrors,
  createMeal
);


// ==========================================
// GET ALL MEALS FOR LOGGED-IN USER
// Protected route
// ==========================================
router.get(
  "/",
  protect,
  getMeals
);


// ==========================================
// GET ONE MEAL BY ID
// User can only access their own meal
// ==========================================
router.get(
  "/:id",
  protect,
  getMealById
);


// ==========================================
// UPDATE ONE MEAL BY ID
// User can only update their own meal
// ==========================================
router.put(
  "/:id",
  protect,
  ...validateMeal,
  handleValidationErrors,
  updateMeal
);


// ==========================================
// DELETE ONE MEAL BY ID
// User can only delete their own meal
// ==========================================
router.delete(
  "/:id",
  protect,
  deleteMeal
);


module.exports = router;