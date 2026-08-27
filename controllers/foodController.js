const Food = require("../models/Food");
const { normalizeUSDANutrition } = require("../utils/nutritionHelper");

// ==========================================
// GET ALL FOODS
// ==========================================
const getFoods = async (req, res) => {
  try {
    const foods = await Food.find();

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch foods",
      error: error.message,
    });
  }
};

// ==========================================
// SEARCH FOOD
// Searches MongoDB first, then USDA
// ==========================================
const searchFoods = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a food search query",
      });
    }

    const searchQuery = query.trim();

    if (searchQuery.length < 2 || searchQuery.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search query must be between 2 and 100 characters",
      });
    }

    // Search local database first
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

    // USDA API configuration
    if (!process.env.USDA_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Nutrition service is not configured",
      });
    }

    const baseUrl =
      "https://api.nal.usda.gov/fdc/v1/foods/search";

    const apiKey = encodeURIComponent(process.env.USDA_API_KEY);
    const encodedQuery = encodeURIComponent(searchQuery);

    // Search standard/basic foods first
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

    // Search branded foods if necessary
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

    const foods = (data.foods || []).map((food) =>
      normalizeUSDANutrition(food)
    );

    res.status(200).json({
      success: true,
      source: "usda",
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Food search error:", error.message);

    res.status(500).json({
      success: false,
      message: "Food search failed",
    });
  }
};

// ==========================================
// GET ONE FOOD
// ==========================================
const getFoodById = async (req, res) => {
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
      food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch food",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE FOOD
// ==========================================
const createFood = async (req, res) => {
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
};

// ==========================================
// UPDATE FOOD
// ==========================================
const updateFood = async (req, res) => {
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
};

// ==========================================
// DELETE FOOD
// ==========================================
const deleteFood = async (req, res) => {
  try {
    const deletedFood = await Food.findByIdAndDelete(
      req.params.id
    );

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
};

module.exports = {
  getFoods,
  searchFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
};