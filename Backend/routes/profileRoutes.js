const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
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


// ==========================================
// CREATE NUTRITION PROFILE
// ==========================================

router.post(
  "/",
  protect,
  createNutritionProfile
);


// ==========================================
// GET MY PROFILE
// ==========================================

router.get(
  "/",
  protect,
  getNutritionProfile
);


// ==========================================
// UPDATE MY PROFILE
// ==========================================

router.put(
  "/",
  protect,
  validateNutritionProfileUpdate,
  handleValidationErrors,
  updateNutritionProfile
);


// ==========================================
// DELETE MY PROFILE
// ==========================================

router.delete(
  "/",
  protect,
  deleteNutritionProfile
);


module.exports = router;