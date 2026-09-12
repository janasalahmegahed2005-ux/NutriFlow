const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createRecipe,
  getRecipes,
  getRecipeById,
  searchRecipes,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipeController");

const router = express.Router();


// ==========================================
// SEARCH RECIPES
// Public route
// ==========================================
router.get("/search", searchRecipes);


// ==========================================
// GET ALL PUBLIC RECIPES
// Public route
// ==========================================
router.get("/", getRecipes);


// ==========================================
// GET ONE RECIPE
// Public route
// ==========================================
router.get("/:id", getRecipeById);


// ==========================================
// CREATE RECIPE
// Protected route
// ==========================================
router.post("/", protect, createRecipe);


// ==========================================
// UPDATE RECIPE
// Protected + owner only
// ==========================================
router.put("/:id", protect, updateRecipe);


// ==========================================
// DELETE RECIPE
// Protected + owner only
// ==========================================
router.delete("/:id", protect, deleteRecipe);


module.exports = router;