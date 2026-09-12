const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createMealPlan,
  getMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan,
} = require("../controllers/mealPlanController");

const router = express.Router();

// CREATE A PLANNED MEAL
router.post(
  "/",
  protect,
  createMealPlan
);

// GET ALL PLANNED MEALS
router.get(
  "/",
  protect,
  getMealPlans
);

// GET ONE PLANNED MEAL
router.get(
  "/:id",
  protect,
  getMealPlanById
);

// UPDATE A PLANNED MEAL
router.put(
  "/:id",
  protect,
  updateMealPlan
);

// DELETE A PLANNED MEAL
router.delete(
  "/:id",
  protect,
  deleteMealPlan
);

module.exports = router;