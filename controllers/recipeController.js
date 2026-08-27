const Recipe = require("../models/Recipe");
const Food = require("../models/Food");


// ==========================================
// CREATE RECIPE
// Protected route
// ==========================================
const createRecipe = async (req, res) => {
  try {
    const {
      name,
      description,
      ingredients,
      mealType,
      instructions,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      vitamins,
      isPublic,
    } = req.body;

    // Check required fields
    if (!name || !ingredients || ingredients.length === 0 || !mealType) {
      return res.status(400).json({
        success: false,
        message: "Name, ingredients, and meal type are required",
      });
    }

    // Verify that all referenced foods exist
    const foodIds = ingredients.map((ingredient) => ingredient.food);

    const foods = await Food.find({
      _id: { $in: foodIds },
    });

    if (foods.length !== foodIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more ingredients refer to invalid foods",
      });
    }

    // Create recipe
    const recipe = new Recipe({
      name,
      description,
      ingredients,
      mealType,
      instructions,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      vitamins,
      createdBy: req.userId,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    const savedRecipe = await recipe.save();

    res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      recipe: savedRecipe,
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe data",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    console.error("Create recipe error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// GET ALL PUBLIC RECIPES
// Public route
// ==========================================
const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({
      isPublic: true,
    })
      .populate("ingredients.food")
      .populate("createdBy", "firstName lastName");

    res.status(200).json({
      success: true,
      count: recipes.length,
      recipes,
    });

  } catch (error) {
    console.error("Get recipes error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// GET ONE RECIPE
// Public route
// ==========================================
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      isPublic: true,
    })
      .populate("ingredients.food")
      .populate("createdBy", "firstName lastName");

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      recipe,
    });

  } catch (error) {
    console.error("Get recipe error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// SEARCH RECIPES
// Public route
// ==========================================
const searchRecipes = async (req, res) => {
  try {
    const { query, mealType } = req.query;

    const filter = {
      isPublic: true,
    };

    if (query) {
      const searchQuery = query.trim();

      if (searchQuery.length < 2 || searchQuery.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Search query must be between 2 and 100 characters",
        });
      }

      filter.name = {
        $regex: searchQuery,
        $options: "i",
      };
    }

    if (mealType) {
      filter.mealType = mealType;
    }

    const recipes = await Recipe.find(filter)
      .populate("ingredients.food")
      .populate("createdBy", "firstName lastName");

    res.status(200).json({
      success: true,
      count: recipes.length,
      recipes,
    });

  } catch (error) {
    console.error("Search recipes error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// UPDATE RECIPE
// Protected route
// Only recipe owner can update
// ==========================================
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      createdBy: req.userId,
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found or access denied",
      });
    }

    const {
      name,
      description,
      ingredients,
      mealType,
      instructions,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      vitamins,
      isPublic,
    } = req.body;

    // If ingredients are being updated, verify the foods
    if (ingredients) {
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Recipe must contain at least one ingredient",
        });
      }

      const foodIds = ingredients.map(
        (ingredient) => ingredient.food
      );

      const foods = await Food.find({
        _id: { $in: foodIds },
      });

      if (foods.length !== foodIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more ingredients refer to invalid foods",
        });
      }

      recipe.ingredients = ingredients;
    }

    if (name !== undefined) recipe.name = name;
    if (description !== undefined) recipe.description = description;
    if (mealType !== undefined) recipe.mealType = mealType;
    if (instructions !== undefined) recipe.instructions = instructions;
    if (calories !== undefined) recipe.calories = calories;
    if (protein !== undefined) recipe.protein = protein;
    if (carbs !== undefined) recipe.carbs = carbs;
    if (fat !== undefined) recipe.fat = fat;
    if (fiber !== undefined) recipe.fiber = fiber;
    if (vitamins !== undefined) recipe.vitamins = vitamins;
    if (isPublic !== undefined) recipe.isPublic = isPublic;

    const updatedRecipe = await recipe.save();

    res.status(200).json({
      success: true,
      message: "Recipe updated successfully",
      recipe: updatedRecipe,
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe data",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    console.error("Update recipe error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// DELETE RECIPE
// Protected route
// Only recipe owner can delete
// ==========================================
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId,
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
      recipe,
    });

  } catch (error) {
    console.error("Delete recipe error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  searchRecipes,
  updateRecipe,
  deleteRecipe,
};