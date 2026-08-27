const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  addLifestyle,
  getTodayLifestyle,
  getLifestyleHistory,
  deleteLifestyle,
} = require("../controllers/lifestyleController");

const router = express.Router();

// ==========================================
// GET TODAY'S LIFESTYLE
// Protected route
// ==========================================
router.get("/today", protect, getTodayLifestyle);

// ==========================================
// GET LIFESTYLE HISTORY
// Protected route
// ==========================================
router.get("/", protect, getLifestyleHistory);

// ==========================================
// ADD / UPDATE LIFESTYLE
// Protected route
// ==========================================
router.post("/", protect, addLifestyle);

// ==========================================
// DELETE LIFESTYLE ENTRY
// Protected + owner only
// ==========================================
router.delete("/:id", protect, deleteLifestyle);

module.exports = router;