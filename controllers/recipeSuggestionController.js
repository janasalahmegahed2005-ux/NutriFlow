const Recipe = require("../models/Recipe");

const {
  searchRecipesByIngredients,
} = require("../services/recipeApiService");


// ==========================================
// NORMALIZE INGREDIENT NAME
// ==========================================

const normalizeIngredient = (name) => {
  if (!name) return "";

  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
};


// ==========================================
// CHECK IF INGREDIENTS MATCH
// ==========================================

const ingredientMatches = (available, required) => {

  const availableName = normalizeIngredient(available);
  const requiredName = normalizeIngredient(required);

  if (!availableName || !requiredName) {
    return false;
  }

  if (availableName === requiredName) {
    return true;
  }

  if (
    availableName.includes(requiredName) ||
    requiredName.includes(availableName)
  ) {
    return true;
  }

  const availableWords = availableName.split(" ");
  const requiredWords = requiredName.split(" ");

  return availableWords.some((word) =>
    requiredWords.includes(word)
  );
};


// ==========================================
// DETERMINE MEAL TYPE
// ==========================================

const getMealType = (category) => {

  const value = normalizeIngredient(category);

  if (
    value.includes("breakfast") ||
    value.includes("brunch")
  ) {
    return "breakfast";
  }

  if (value.includes("dessert")) {
    return "dessert";
  }

  if (
    value.includes("starter") ||
    value.includes("side")
  ) {
    return "snack";
  }

  return "dinner";
};


// ==========================================
// GET RECIPE SUGGESTIONS
// MongoDB + TheMealDB
// ==========================================

const getRecipeSuggestions = async (req, res) => {

  try {

    const { ingredients } = req.body;


    // ==========================================
    // VALIDATE INPUT
    // ==========================================

    if (!Array.isArray(ingredients) || ingredients.length === 0) {

      return res.status(400).json({
        success: false,
        message: "Please provide at least one ingredient",
      });

    }


    const availableIngredients = [
      ...new Set(
        ingredients
          .filter(
            (ingredient) =>
              typeof ingredient === "string"
          )
          .map((ingredient) =>
            ingredient.trim().toLowerCase()
          )
          .filter(
            (ingredient) =>
              ingredient.length > 0
          )
      ),
    ];


    if (availableIngredients.length === 0) {

      return res.status(400).json({
        success: false,
        message: "Please provide valid ingredient names",
      });

    }


    // ==========================================
    // 1. GET RECIPES FROM YOUR MONGODB
    // ==========================================

    const localRecipes = await Recipe.find({
      isPublic: true,
    }).populate("ingredients.food");


    const localSuggestions = localRecipes

      .map((recipe) => {

        const recipeIngredients =
          recipe.ingredients
            .filter((item) => item.food)
            .map((item) =>
              item.food.name.trim().toLowerCase()
            );


        const matchedIngredients =
          recipeIngredients.filter(
            (recipeIngredient) =>
              availableIngredients.some(
                (availableIngredient) =>
                  ingredientMatches(
                    availableIngredient,
                    recipeIngredient
                  )
              )
          );


        const missingIngredients =
          recipeIngredients.filter(
            (recipeIngredient) =>
              !availableIngredients.some(
                (availableIngredient) =>
                  ingredientMatches(
                    availableIngredient,
                    recipeIngredient
                  )
              )
          );


        const totalIngredients =
          recipeIngredients.length;


        const matchPercentage =
          totalIngredients > 0
            ? Math.round(
                (matchedIngredients.length /
                  totalIngredients) *
                  100
              )
            : 0;


        return {

          source: "nutriflow",

          recipe: {

            _id: String(recipe._id),

            name: recipe.name,

            description:
              recipe.description || "",

            mealType:
              recipe.mealType || "dinner",

            calories:
              recipe.calories || 0,

            protein:
              recipe.protein || 0,

            carbs:
              recipe.carbs || 0,

            fat:
              recipe.fat || 0,

            fiber:
              recipe.fiber || 0,

            vitamins:
              recipe.vitamins || [],

            instructions:
              recipe.instructions || "",

            image:
              recipe.image || null,
          },

          matchedIngredients,

          missingIngredients,

          matchedCount:
            matchedIngredients.length,

          totalIngredients,

          matchPercentage,
        };

      })

      .filter(
        (suggestion) =>
          suggestion.matchedCount > 0
      );


    // ==========================================
    // 2. GET RECIPES FROM THEMEALDB
    // ==========================================

    let externalSuggestions = [];


    try {

      const externalRecipes =
        await searchRecipesByIngredients(
          availableIngredients
        );


      externalSuggestions =
        externalRecipes.map((recipe) => {

          const recipeIngredients =
            recipe.details?.ingredients || [];


          // --------------------------------------
          // Match user's ingredients against
          // TheMealDB recipe ingredients
          // --------------------------------------

          const matchedIngredients = [];

          const missingIngredients = [];


          for (const userIngredient of availableIngredients) {

            const matchingRecipeIngredient =
              recipeIngredients.find(
                (recipeIngredient) =>
                  ingredientMatches(
                    userIngredient,
                    recipeIngredient.name
                  )
              );


            if (matchingRecipeIngredient) {

              matchedIngredients.push(
                matchingRecipeIngredient.name
              );

            } else {

              missingIngredients.push(
                userIngredient
              );

            }

          }


          const matchedCount =
            matchedIngredients.length;


          const totalIngredients =
            availableIngredients.length;


          const matchPercentage =
            totalIngredients > 0
              ? Math.round(
                  (matchedCount /
                    totalIngredients) *
                    100
                )
              : 0;


          // --------------------------------------
          // TheMealDB does not provide nutrition
          // --------------------------------------

          const calories = 0;
          const protein = 0;
          const carbs = 0;
          const fat = 0;
          const fiber = 0;


          // --------------------------------------
          // Description
          // --------------------------------------

          const description = [
            recipe.details?.category,
            recipe.details?.area
          ]
            .filter(Boolean)
            .join(" • ");


          // --------------------------------------
          // Meal type
          // --------------------------------------

          const mealType =
            getMealType(
              recipe.details?.category
            );


          // --------------------------------------
          // Return NutriFlow-compatible format
          // --------------------------------------

          return {

            source: "themealdb",

            externalId:
              String(recipe.id),

            recipe: {

              _id:
                `themealdb-${recipe.id}`,

              name:
                recipe.title || "Recipe",

              description,

              mealType,

              calories,

              protein,

              carbs,

              fat,

              fiber,

              vitamins: [],

              instructions:
                recipe.details?.instructions || "",

              image:
                recipe.image || null,
            },

            matchedIngredients,

            missingIngredients,

            matchedCount,

            totalIngredients,

            matchPercentage,
          };

        });


    } catch (externalError) {

      console.error(
        "TheMealDB error:",
        externalError.message
      );

      externalSuggestions = [];

    }


    // ==========================================
    // 3. COMBINE BOTH SOURCES
    // ==========================================

    const allSuggestions = [

      ...localSuggestions,

      ...externalSuggestions,

    ];


    // ==========================================
    // 4. REMOVE DUPLICATE RECIPE NAMES
    // ==========================================

    const uniqueSuggestions = [];

    const recipeNames = new Set();


    for (const suggestion of allSuggestions) {

      const normalizedName =
        normalizeIngredient(
          suggestion.recipe.name
        );


      if (
        !recipeNames.has(normalizedName)
      ) {

        recipeNames.add(normalizedName);

        uniqueSuggestions.push(
          suggestion
        );

      }

    }


    // ==========================================
    // 5. SORT BEST MATCHES FIRST
    // ==========================================

    uniqueSuggestions.sort(
      (a, b) => {

        if (
          b.matchPercentage !==
          a.matchPercentage
        ) {

          return (
            b.matchPercentage -
            a.matchPercentage
          );

        }


        if (
          b.matchedCount !==
          a.matchedCount
        ) {

          return (
            b.matchedCount -
            a.matchedCount
          );

        }


        return (
          a.missingIngredients.length -
          b.missingIngredients.length
        );

      }
    );


    // ==========================================
    // 6. SEND RESPONSE
    // ==========================================

    res.status(200).json({

      success: true,

      count:
        uniqueSuggestions.length,

      sources: {

        nutriflow:
          localSuggestions.length,

        themealdb:
          externalSuggestions.length,

      },

      suggestions:
        uniqueSuggestions,

    });


  } catch (error) {

    console.error(
      "Recipe suggestion error:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        "An internal server error occurred",

    });

  }

};


module.exports = {
  getRecipeSuggestions,
};
