const express = require("express");
const router = express.Router();


const { loginLimiter,} = require("../middleware/rateLimitMiddleware");

const {registerUser, 
  getCurrentUser,
  loginUser,
} = require("../controllers/authController");


const protect = require("../middleware/authMiddleware");
const uploadProfileImage = require("../middleware/uploadMiddleware");



// ==========================================
// REGISTER
// ==========================================
router.post(
  "/register",
  uploadProfileImage.single("image"),
  registerUser
);

// ==========================================
// GET CURRENT LOGGED-IN USER
// ==========================================
router.get("/me", protect, getCurrentUser);


// ==========================================
// LOGIN
// ==========================================
router.post("/login", loginLimiter, loginUser);


module.exports = router;