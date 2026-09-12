const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getBalanceScore,
} = require("../controllers/balanceController");

const router = express.Router();

// ==========================================
// GET TODAY'S BALANCE SCORE
// Protected route
// ==========================================
router.get("/", protect, getBalanceScore);

module.exports = router;