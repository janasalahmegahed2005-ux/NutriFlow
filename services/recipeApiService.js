// ==========================================
// EXTERNAL RECIPE API SERVICE
// TheMealDB integration
// ==========================================

// TheMealDB provides a free development/educational API key.
// Key "1" is the official test key.
const THEMEALDB_API_KEY = "1";

const THEMEALDB_BASE_URL =
  `https://www.themealdb.com/api/json/v1/${THEMEALDB_API_KEY}`;


// ==========================================
// Normalize ingredient names
// ==========================================

const normalizeIngredient = (ingredient) => {
  return String(ingredient || "")
    .toLowerCase()
    .trim()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");
};


// ==========================================
// Check whether two ingredients match
// ==========================================

const ingredientMatches = (userIngredient, recipeIngredient) => {

  const user = normalizeIngredient(userIngredient);
  const recipe = normalizeIngredient(recipeIngredient);

  if (!user || !recipe) {
    return false;
  }

  return (
    user === recipe ||
    user.includes(recipe) ||
    recipe.includes(user)
  );
};


// ==========================================
// Extract ingredients from TheMealDB meal
// ==========================================

const extractIngredients = (meal) => {

  const ingredients = [];

  for (let i = 1; i <= 20; i++) {

    const ingredient =
      meal[`strIngredient${i}`];

    const measure =
      meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {

      ingredients.push({
        name: ingredient.trim(),
        measure: measure ? measure.trim() : "",
      });

    }
  }

  return ingredients;
};


// ==========================================
// Get full meal information by ID
// ==========================================

const getRecipeInformation = async (recipeId) => {

  const url =
    `${THEMEALDB_BASE_URL}/lookup.php?i=${encodeURIComponent(recipeId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {

    console.error(
      "TheMealDB recipe details error:",
      response.status
    );

    return null;
  }

  const data = await response.json();

  if (!data.meals || data.meals.length === 0) {
    return null;
  }

  const meal = data.meals[0];

  const ingredients = extractIngredients(meal);

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    category: meal.strCategory || "",
    area: meal.strArea || "",
    instructions: meal.strInstructions || "",
    youtube: meal.strYoutube || "",
    sourceUrl: meal.strSource || "",
    ingredients,
    nutrition: null,
  };
};


// ==========================================
// Search meals by ONE ingredient
// ==========================================

const searchBySingleIngredient = async (ingredient) => {

  const normalizedIngredient =
    normalizeIngredient(ingredient);

  if (!normalizedIngredient) {
    return [];
  }

  const url =
    `${THEMEALDB_BASE_URL}/filter.php?i=${encodeURIComponent(
      normalizedIngredient.replace(/\s+/g, "_")
    )}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {

    console.error(
      "TheMealDB ingredient search error:",
      response.status
    );

    return [];
  }

  const data = await response.json();

  return data.meals || [];
};


// ==========================================
// Search recipes using ALL user ingredients
// ==========================================
//
// TheMealDB free V1 supports filtering by one
// ingredient. We therefore:
// 1. Search each ingredient separately.
// 2. Combine the candidate recipes.
// 3. Remove duplicates.
// 4. Load their full ingredient lists.
// 5. Calculate the match percentage ourselves.
// ==========================================

const searchRecipesByIngredients = async (ingredients) => {

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return [];
  }

  const cleanIngredients = [
    ...new Set(
      ingredients
        .map(normalizeIngredient)
        .filter(Boolean)
    ),
  ];

  // Search TheMealDB for every ingredient
  const searchResults = await Promise.all(
    cleanIngredients.map(
      (ingredient) =>
        searchBySingleIngredient(ingredient)
    )
  );

  // Combine all results
  const allMeals = searchResults.flat();

  // Remove duplicate meals
  const uniqueMeals = new Map();

  for (const meal of allMeals) {

    if (meal?.idMeal) {
      uniqueMeals.set(meal.idMeal, meal);
    }
  }

  const candidateMeals =
    Array.from(uniqueMeals.values());

  // Load complete recipe information
  const detailedMeals = await Promise.all(
    candidateMeals.map(async (meal) => {

      try {

        const details =
          await getRecipeInformation(meal.idMeal);

        if (!details) {
          return null;
        }

        return {
          ...meal,
          details,
        };

      } catch (error) {

        console.error(
          `Failed to get TheMealDB recipe ${meal.idMeal}:`,
          error.message
        );

        return null;
      }
    })
  );

  // Remove failed lookups
  const validMeals =
    detailedMeals.filter(Boolean);

  // Calculate matching ingredients
  const scoredMeals = validMeals.map((meal) => {

    const recipeIngredients =
      meal.details.ingredients || [];

    const matchedIngredients = [];
    const missingIngredients = [];

    for (const userIngredient of cleanIngredients) {

      const matched =
        recipeIngredients.some((recipeIngredient) =>
          ingredientMatches(
            userIngredient,
            recipeIngredient.name
          )
        );

      if (matched) {

        const matchedName =
          recipeIngredients.find((recipeIngredient) =>
            ingredientMatches(
              userIngredient,
              recipeIngredient.name
            )
          )?.name;

        matchedIngredients.push(
          matchedName || userIngredient
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
      cleanIngredients.length;

    const matchPercentage =
      totalIngredients > 0
        ? Math.round(
            (matchedCount / totalIngredients) * 100
          )
        : 0;

    return {

      id: meal.idMeal,

      title: meal.strMeal,

      image: meal.strMealThumb,

      usedIngredients:
        matchedIngredients.map((name) => ({
          name,
        })),

      missedIngredients:
        missingIngredients.map((name) => ({
          name,
        })),

      usedIngredientCount:
        matchedCount,

      missedIngredientCount:
        missingIngredients.length,

      details: meal.details,

      matchPercentage,

      matchedIngredients,

      missingIngredients,

      matchedCount,

      totalIngredients,
    };
  });

  // Sort best matches first
  scoredMeals.sort((a, b) => {

    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }

    return (
      b.matchedCount - a.matchedCount
    );
  });

  // Return the best 12 external recipes
  return scoredMeals.slice(0, 12);
};


// ==========================================
// Get details for multiple recipes
// ==========================================

const getRecipeDetails = async (recipes) => {

  const detailedRecipes = await Promise.all(

    recipes.map(async (recipe) => {

      try {

        // The search function already retrieved
        // complete TheMealDB information.
        if (recipe.details) {
          return recipe;
        }

        const details =
          await getRecipeInformation(recipe.id);

        if (!details) {
          return recipe;
        }

        return {
          ...recipe,
          details,
        };

      } catch (error) {

        console.error(
          `Failed to get recipe ${recipe.id}:`,
          error.message
        );

        return recipe;
      }
    })
  );

  return detailedRecipes;
};


// ==========================================
// Export
// ==========================================

module.exports = {
  searchRecipesByIngredients,
  getRecipeInformation,
  getRecipeDetails,
};

