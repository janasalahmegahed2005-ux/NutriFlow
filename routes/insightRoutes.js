const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getInsights,
} = require("../controllers/insightController");

const router = express.Router();

// ==========================================
// GET TODAY'S NUTRITION INSIGHTS
// Protected route
// ==========================================
router.get("/", protect, getInsights);

module.exports = router;