const Recipe = require("../models/Recipe");

// ==========================================
// GET RECIPE SUGGESTIONS
// "WHAT CAN I MAKE?"
// Protected route
// ==========================================
const getRecipeSuggestions = async (req, res) => {
  try {
    const { ingredients } = req.body;

    // Validate ingredients input
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one ingredient",
      });
    }

    // Clean and normalize ingredient names
    const availableIngredients = ingredients
      .filter((ingredient) => typeof ingredient === "string")
      .map((ingredient) => ingredient.trim().toLowerCase())
      .filter((ingredient) => ingredient.length > 0);

    if (availableIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid ingredient names",
      });
    }

    // Get public recipes
    const recipes = await Recipe.find({
      isPublic: true,
    }).populate("ingredients.food");

    const suggestions = recipes.map((recipe) => {
      // Get the names of ingredients required by the recipe
      const recipeIngredients = recipe.ingredients
        .filter((item) => item.food)
        .map((item) => item.food.name.trim().toLowerCase());

      // Find ingredients the user has
      const matchedIngredients = recipeIngredients.filter(
        (ingredient) =>
          availableIngredients.includes(ingredient)
      );

      // Find ingredients the user is missing
      const missingIngredients = recipeIngredients.filter(
        (ingredient) =>
          !availableIngredients.includes(ingredient)
      );

      // Calculate match percentage
      const totalIngredients = recipeIngredients.length;

      const matchPercentage =
        totalIngredients > 0
          ? Math.round(
              (matchedIngredients.length / totalIngredients) * 100
            )
          : 0;

      return {
        recipe: {
          _id: recipe._id,
          name: recipe.name,
          description: recipe.description,
          mealType: recipe.mealType,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          fiber: recipe.fiber,
          vitamins: recipe.vitamins,
          instructions: recipe.instructions,
        },

        matchedIngredients,
        missingIngredients,

        matchedCount: matchedIngredients.length,
        totalIngredients,

        matchPercentage,
      };
    });

    // Sort best matches first
    suggestions.sort(
      (a, b) =>
        b.matchPercentage - a.matchPercentage ||
        b.matchedCount - a.matchedCount
    );

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    console.error(
      "Recipe suggestion error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};

module.exports = {
  getRecipeSuggestions,
};