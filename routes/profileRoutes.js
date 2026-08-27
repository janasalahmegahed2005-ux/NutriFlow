const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  validateNutritionProfile,
  handleValidationErrors,
} = require("../middleware/validationMiddleware");

const {
  createNutritionProfile,
  getNutritionProfile,
  updateNutritionProfile,
  deleteNutritionProfile,
} = require("../controllers/profileController");

const router = express.Router();


// ==========================================
// CREATE NUTRITION PROFILE
// Protected + Validated
// ==========================================
router.post(
  "/",
  protect,
  ...validateNutritionProfile,
  handleValidationErrors,
  createNutritionProfile
);


// ==========================================
// GET MY NUTRITION PROFILE
// Protected route
// ==========================================
router.get(
  "/",
  protect,
  getNutritionProfile
);


// ==========================================
// UPDATE MY NUTRITION PROFILE
// Protected + Validated
// ==========================================
router.put(
  "/",
  protect,
  ...validateNutritionProfile,
  handleValidationErrors,
  updateNutritionProfile
);


// ==========================================
// DELETE MY NUTRITION PROFILE
// Protected route
// ==========================================
router.delete(
  "/",
  protect,
  deleteNutritionProfile
);


module.exports = router;