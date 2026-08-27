const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  addWeightEntry,
  getWeightHistory,
  getProgress,
  deleteWeightEntry,
} = require("../controllers/progressController");

const router = express.Router();


// ==========================================
// ADD WEIGHT ENTRY
// Protected route
// ==========================================
router.post(
  "/weight",
  protect,
  addWeightEntry
);


// ==========================================
// GET WEIGHT HISTORY
// Protected route
// ==========================================
router.get(
  "/weight",
  protect,
  getWeightHistory
);


// ==========================================
// GET COMPLETE PROGRESS
// Protected route
// ==========================================
router.get(
  "/",
  protect,
  getProgress
);


// ==========================================
// DELETE WEIGHT ENTRY
// Protected route
// ==========================================
router.delete(
  "/weight/:id",
  protect,
  deleteWeightEntry
);


module.exports = router;