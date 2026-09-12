const express = require("express");
const Food = require("../models/Food");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  foodSearchLimiter,
} = require("../middleware/rateLimitMiddleware");
const {
  validateFood,
  validateFoodUpdate,
  handleValidationErrors,
} = require("../middleware/validationMiddleware");

const { normalizeUSDANutrition } = require("../utils/nutritionHelper");

const {
  getFoods,
  searchFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");


const router = express.Router();


// ==========================================
// GET ALL FOODS
// Public route
// ==========================================
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find();

    res.status(200).json({
      success: true,
      count: foods.length,
      foods: foods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch foods",
      error: error.message,
    });
  }
});


// ==========================================
// SEARCH FOOD
// Searches MongoDB first, then USDA if needed
// Protected route
// ==========================================
router.get(
  "/search",
  protect,
  foodSearchLimiter,
  async (req, res) => {  try {
    const { query } = req.query;

    // Validate search query
    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a food search query",
      });
    }

    // Remove unnecessary spaces
    const searchQuery = query.trim();

    // Security: prevent excessively long queries
    if (searchQuery.length < 2 || searchQuery.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search query must be between 2 and 100 characters",
      });
    }

    // ==========================================
    // 1. SEARCH OUR OWN DATABASE FIRST
    // ==========================================

    const localFoods = await Food.find({
      name: { $regex: searchQuery, $options: "i" },
    }).limit(10);

    if (localFoods.length > 0) {
      return res.status(200).json({
        success: true,
        source: "local",
        count: localFoods.length,
        foods: localFoods,
      });
    }

    // ==========================================
    // 2. SEARCH USDA FOODDATA CENTRAL
    // ==========================================

    if (!process.env.USDA_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Nutrition service is not configured",
      });
    }

    // ==========================================
// USDA SEARCH
// Prioritize standard/basic food data first
// ==========================================

const baseUrl =
  "https://api.nal.usda.gov/fdc/v1/foods/search";

const apiKey = encodeURIComponent(process.env.USDA_API_KEY);
const encodedQuery = encodeURIComponent(searchQuery);

// First search: standard/basic foods
const standardUrl =
  `${baseUrl}?api_key=${apiKey}` +
  `&query=${encodedQuery}` +
  `&dataType=Foundation,SR%20Legacy,FNDDS` +
  `&pageSize=10`;

let response = await fetch(standardUrl);

if (!response.ok) {
  return res.status(502).json({
    success: false,
    message: "Nutrition service is temporarily unavailable",
  });
}

let data = await response.json();

// ==========================================
// FALLBACK: BRANDED FOODS
// Only search branded products if no
// standard food results were found.
// ==========================================

if (!data.foods || data.foods.length === 0) {
  const brandedUrl =
    `${baseUrl}?api_key=${apiKey}` +
    `&query=${encodedQuery}` +
    `&dataType=Branded` +
    `&pageSize=10`;

  response = await fetch(brandedUrl);

  if (!response.ok) {
    return res.status(502).json({
      success: false,
      message: "Nutrition service is temporarily unavailable",
    });
  }

  data = await response.json();
}

    // ==========================================
    // 3. RETURN SAFE USDA DATA
    // ==========================================

   const foods = (data.foods || []).map((food) =>
  normalizeUSDANutrition(food)
);

    return res.status(200).json({
      success: true,
      source: "usda",
      count: foods.length,
      foods: foods,
    });
  } catch (error) {
    console.error("Food search error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Food search failed",
    });
  }
});

// ==========================================
// GET ONE FOOD BY ID
// Public route
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    res.status(200).json({
      success: true,
      food: food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch food",
      error: error.message,
    });
  }
});


// ==========================================
// CREATE NEW FOOD
// Protected + Admin only
// ==========================================
router.post(
  "/",
  protect,
  adminOnly,
  validateFood,
  handleValidationErrors,
  async (req, res) => {
      try {
    const {
      name,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      vitamins,
    } = req.body;

    const newFood = new Food({
      name,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      vitamins,
    });

    const savedFood = await newFood.save();

    res.status(201).json({
      success: true,
      message: "Food created successfully",
      food: savedFood,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create food",
      error: error.message,
    });
  }
});


// ==========================================
// UPDATE FOOD BY ID
// Protected + Admin only
// ==========================================
router.put(
  "/:id",
  protect,
  adminOnly,
  validateFoodUpdate,
  handleValidationErrors,
  async (req, res) => {
      try {
    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedFood) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food updated successfully",
      food: updatedFood,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update food",
      error: error.message,
    });
  }
});


// ==========================================
// DELETE FOOD BY ID
// Protected + Admin only
// ==========================================
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const deletedFood = await Food.findByIdAndDelete(req.params.id);

    if (!deletedFood) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food deleted successfully",
      food: deletedFood,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete food",
      error: error.message,
    });
  }
});


// ==========================================
// EXPORT ROUTER
// ==========================================
module.exports = router;