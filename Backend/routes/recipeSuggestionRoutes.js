const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getRecipeSuggestions,
} = require("../controllers/recipeSuggestionController");

const router = express.Router();

// ==========================================
// GET RECIPE SUGGESTIONS
// "WHAT CAN I MAKE?"
// Protected route
// ==========================================
router.post("/", protect, getRecipeSuggestions);

module.exports = router;