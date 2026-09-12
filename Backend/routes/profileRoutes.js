const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  validateNutritionProfile,
  validateNutritionProfileUpdate,
  handleValidationErrors,
} = require("../middleware/validationMiddleware");

const {
  createNutritionProfile,
  getNutritionProfile,
  updateNutritionProfile,
  deleteNutritionProfile,
} = require("../controllers/profileController");

const router = express.Router();

// CREATE NUTRITION PROFILE
router.post(
  "/",
  protect,
  ...validateNutritionProfile,
  handleValidationErrors,
  createNutritionProfile
);

// GET MY NUTRITION PROFILE
router.get(
  "/",
  protect,
  getNutritionProfile
);

// UPDATE MY NUTRITION PROFILE
router.put(
  "/",
  protect,
  ...validateNutritionProfileUpdate,
  handleValidationErrors,
  updateNutritionProfile
);

// DELETE MY NUTRITION PROFILE
router.delete(
  "/",
  protect,
  deleteNutritionProfile
);

module.exports = router;