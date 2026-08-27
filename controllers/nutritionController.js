const Meal = require("../models/Meal");
const NutritionProfile = require("../models/NutritionProfile");


// ==========================================
// GET TODAY'S NUTRITION SUMMARY
// ==========================================
const getNutritionSummary = async (req, res) => {
  try {
    // Get the user's nutrition profile
    const profile = await NutritionProfile.findOne({
      user: req.userId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Nutrition profile not found",
      });
    }


    // ==========================================
    // START OF TODAY
    // ==========================================

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);


    // ==========================================
    // START OF TOMORROW
    // ==========================================

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);


    // ==========================================
    // GET TODAY'S MEALS
    // BELONGING TO THE LOGGED-IN USER
    // ==========================================

    const meals = await Meal.find({
      user: req.userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });


    // ==========================================
    // CALCULATE CONSUMED NUTRITION
    // ==========================================

    const consumed = meals.reduce(
      (totals, meal) => {
        totals.calories += meal.calories;
        totals.protein += meal.protein;
        totals.carbs += meal.carbs;
        totals.fat += meal.fat;
        totals.fiber += meal.fiber;

        return totals;
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      }
    );


    // ==========================================
    // CALCULATE REMAINING NUTRITION
    // ==========================================

    const remainingCalories = Math.max(
      0,
      profile.dailyCalories - consumed.calories
    );

    const remainingProtein = Math.max(
      0,
      profile.proteinTarget - consumed.protein
    );

    const remainingCarbs = Math.max(
      0,
      profile.carbsTarget - consumed.carbs
    );

    const remainingFat = Math.max(
      0,
      profile.fatTarget - consumed.fat
    );

    const remainingFiber = Math.max(
      0,
      profile.fiberTarget - consumed.fiber
    );


    // ==========================================
    // RETURN SUMMARY
    // ==========================================

    res.status(200).json({
      success: true,

      summary: {
        date: startOfDay,

        targets: {
          calories: profile.dailyCalories,
          protein: profile.proteinTarget,
          carbs: profile.carbsTarget,
          fat: profile.fatTarget,
          fiber: profile.fiberTarget,
        },

        consumed,

        remaining: {
          calories: remainingCalories,
          protein: remainingProtein,
          carbs: remainingCarbs,
          fat: remainingFat,
          fiber: remainingFiber,
        },

        mealsCount: meals.length,
      },
    });

  } catch (error) {
    console.error("Nutrition summary error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


module.exports = {
  getNutritionSummary,
};