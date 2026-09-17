const express = require("express");

const protect = require("../middleware/authMiddleware");

const adminOnly = require("../middleware/adminMiddleware");

const {
  getAllUsers,
  getUserDetails,
  deleteUser,
} = require("../controllers/adminController");

const router = express.Router();


// ==========================================
// GET ALL USERS
// ==========================================

router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);


// ==========================================
// GET ONE USER + JOURNEY
// ==========================================

router.get(
  "/users/:userId",
  protect,
  adminOnly,
  getUserDetails
);


// ==========================================
// DELETE USER
// ==========================================

router.delete(
  "/users/:userId",
  protect,
  adminOnly,
  deleteUser
);


module.exports = router;