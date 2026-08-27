const express = require("express");

const protect = require("../middleware/authMiddleware");
const {
  loginLimiter,
} = require("../middleware/rateLimitMiddleware");

const {
  registerUser,
  getCurrentUser,
  loginUser,
} = require("../controllers/authController");

const router = express.Router();


// ==========================================
// REGISTER
// ==========================================
router.post("/register", registerUser);


// ==========================================
// GET CURRENT LOGGED-IN USER
// ==========================================
router.get("/me", protect, getCurrentUser);


// ==========================================
// LOGIN
// ==========================================
router.post("/login", loginLimiter, loginUser);


module.exports = router;