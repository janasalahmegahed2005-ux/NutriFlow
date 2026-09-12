const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  addWater,
  getWaterHistory,
  getTodayWater,
  deleteWater,
} = require("../controllers/waterController");

const router = express.Router();

// ==========================================
// GET TODAY'S WATER
// Protected route
// ==========================================
router.get("/today", protect, getTodayWater);

// ==========================================
// GET WATER HISTORY
// Protected route
// ==========================================
router.get("/", protect, getWaterHistory);

// ==========================================
// ADD WATER
// Protected route
// ==========================================
router.post("/", protect, addWater);

// ==========================================
// DELETE WATER ENTRY
// Protected + owner only
// ==========================================
router.delete("/:id", protect, deleteWater);

module.exports = router;