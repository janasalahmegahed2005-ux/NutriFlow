const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getNutritionSummary,
} = require("../controllers/nutritionController");

const router = express.Router();


// ==========================================
// GET TODAY'S NUTRITION SUMMARY
// Protected route
// ==========================================
router.get(
  "/summary",
  protect,
  getNutritionSummary
);


module.exports = router;