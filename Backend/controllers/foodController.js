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
    console.error("Get foods error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch foods",
    });
  }
};


// ==========================================
// SEARCH FOOD
// Searches MongoDB + USDA
// ==========================================

const searchFoods = async (req, res) => {
  try {
    const { query } = req.query;

    // ==========================================
    // VALIDATE QUERY
    // ==========================================

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


    // ==========================================
    // 1. SEARCH MONGODB
    // ==========================================

    const localFoods = await Food.find({
      name: {
        $regex: searchQuery,
        $options: "i",
      },
    }).limit(20);


    // ==========================================
    // 2. SEARCH USDA
    // ==========================================

    let usdaFoods = [];

    const USDA_API_KEY = process.env.USDA_API_KEY;

    console.log(
      "USDA API key configured:",
      Boolean(USDA_API_KEY)
    );


    if (USDA_API_KEY) {

      const baseUrl =
        "https://api.nal.usda.gov/fdc/v1/foods/search";


      // ==========================================
      // USDA STANDARD FOODS
      // ==========================================

      const standardParams = new URLSearchParams({
        api_key: USDA_API_KEY,
        query: searchQuery,
        dataType: "Foundation,SR Legacy,FNDDS",
        pageSize: "30",
      });


      const standardUrl =
        `${baseUrl}?${standardParams.toString()}`;


      try {

        const standardResponse =
          await fetch(standardUrl);


        console.log(
          "USDA standard status:",
          standardResponse.status
        );


        if (standardResponse.ok) {

          const data =
            await standardResponse.json();


          const standardFoods =
            (data.foods || []).map((food) =>
              normalizeUSDANutrition(food)
            );


          usdaFoods.push(
            ...standardFoods
          );
        }

      } catch (error) {

        console.error(
          "USDA standard search error:",
          error.message
        );
      }


      // ==========================================
      // USDA BRANDED FOODS
      // ==========================================

      const brandedParams = new URLSearchParams({
        api_key: USDA_API_KEY,
        query: searchQuery,
        dataType: "Branded",
        pageSize: "30",
      });


      const brandedUrl =
        `${baseUrl}?${brandedParams.toString()}`;


      try {

        const brandedResponse =
          await fetch(brandedUrl);


        console.log(
          "USDA branded status:",
          brandedResponse.status
        );


        if (brandedResponse.ok) {

          const data =
            await brandedResponse.json();


          const brandedFoods =
            (data.foods || []).map((food) =>
              normalizeUSDANutrition(food)
            );


          usdaFoods.push(
            ...brandedFoods
          );
        }

      } catch (error) {

        console.error(
          "USDA branded search error:",
          error.message
        );
      }

    } else {

      console.log(
        "USDA_API_KEY is missing from environment variables."
      );
    }


    // ==========================================
    // 3. COMBINE LOCAL + USDA
    // ==========================================

    const combinedFoods = [
      ...localFoods,
      ...usdaFoods,
    ];


    // ==========================================
    // 4. REMOVE DUPLICATES
    // ==========================================

    const uniqueFoods = [];

    const seenNames = new Set();


    for (const food of combinedFoods) {

      if (!food || !food.name) {
        continue;
      }


      const normalizedName =
        food.name
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();


      if (!seenNames.has(normalizedName)) {

        seenNames.add(normalizedName);

        uniqueFoods.push(food);
      }
    }


    // ==========================================
    // 5. SCORE RESULTS
    // ==========================================

    const searchLower =
      searchQuery.toLowerCase();


    const queryWords =
      searchLower
        .split(/\s+/)
        .filter(Boolean);


    const scoredFoods =
      uniqueFoods.map((food) => {

        const name =
          food.name.toLowerCase();


        let score = 0;


        // Exact match
        if (name === searchLower) {
          score += 100;
        }


        // Starts with search
        if (name.startsWith(searchLower)) {
          score += 50;
        }


        // Contains complete search phrase
        if (name.includes(searchLower)) {
          score += 30;
        }


        // Matching words
        for (const word of queryWords) {

          if (name.includes(word)) {
            score += 20;
          }
        }


        return {
          food,
          score,
        };

      });


    // Highest score first

    scoredFoods.sort(
      (a, b) => b.score - a.score
    );


    // ==========================================
    // 6. SELECT TOP RESULTS
    // ==========================================

    const selectedFoods =
      scoredFoods
        .slice(0, 10)
        .map((item) => item.food);


    // ==========================================
    // 7. RESPONSE
    // ==========================================

    console.log(
      `Food search "${searchQuery}":`,
      `${localFoods.length} local +`,
      `${usdaFoods.length} USDA =`,
      `${selectedFoods.length} results`
    );


    res.status(200).json({
      success: true,

      source:
        usdaFoods.length > 0
          ? "local+usda"
          : "local",

      count:
        selectedFoods.length,

      foods:
        selectedFoods,
    });

  } catch (error) {

    console.error(
      "Food search error:",
      error.message
    );


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

    const food =
      await Food.findById(
        req.params.id
      );


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

    console.error(
      "Get food error:",
      error.message
    );


    res.status(500).json({
      success: false,
      message: "Failed to fetch food",
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


    const newFood =
      new Food({
        name,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        vitamins,
      });


    const savedFood =
      await newFood.save();


    res.status(201).json({
      success: true,
      message: "Food created successfully",
      food: savedFood,
    });

  } catch (error) {

    console.error(
      "Create food error:",
      error.message
    );


    res.status(500).json({
      success: false,
      message: "Failed to create food",
    });
  }
};


// ==========================================
// UPDATE FOOD
// ==========================================

const updateFood = async (req, res) => {
  try {

    const updatedFood =
      await Food.findByIdAndUpdate(
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

    console.error(
      "Update food error:",
      error.message
    );


    res.status(500).json({
      success: false,
      message: "Failed to update food",
    });
  }
};


// ==========================================
// DELETE FOOD
// ==========================================

const deleteFood = async (req, res) => {
  try {

    const deletedFood =
      await Food.findByIdAndDelete(
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

    console.error(
      "Delete food error:",
      error.message
    );


    res.status(500).json({
      success: false,
      message: "Failed to delete food",
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getFoods,
  searchFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
};

