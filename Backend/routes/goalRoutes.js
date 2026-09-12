const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createGoal,
  getMyGoal,
  getMyGoals,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");

const router = express.Router();


// ==========================================
// CREATE GOAL
// Protected route
// ==========================================
router.post(
  "/",
  protect,
  createGoal
);


// ==========================================
// GET MY ACTIVE GOAL
// Protected route
// ==========================================
router.get(
  "/",
  protect,
  getMyGoal
);


// ==========================================
// GET ALL MY GOALS
// Protected route
// ==========================================
router.get(
  "/history",
  protect,
  getMyGoals
);


// ==========================================
// UPDATE MY ACTIVE GOAL
// Protected route
// ==========================================
router.put(
  "/",
  protect,
  updateGoal
);


// ==========================================
// DEACTIVATE MY ACTIVE GOAL
// Protected route
// ==========================================
router.delete(
  "/",
  protect,
  deleteGoal
);


module.exports = router;