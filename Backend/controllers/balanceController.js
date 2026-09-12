const Meal = require("../models/Meal");
const NutritionProfile = require("../models/NutritionProfile");
const Water = require("../models/Water");

// ==========================================
// GET TODAY'S BALANCE SCORE
// Protected route
// ==========================================
const getBalanceScore = async (req, res) => {
  try {
    // Get nutrition profile
    const profile = await NutritionProfile.findOne({
      user: req.userId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Nutrition profile not found",
      });
    }

    // Start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Get today's meals
    const meals = await Meal.find({
      user: req.userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    // Get today's water
    const waterEntries = await Water.find({
      user: req.userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    // Calculate consumed nutrition
    const consumed = meals.reduce(
      (totals, meal) => {
        totals.calories += meal.calories || 0;
        totals.protein += meal.protein || 0;
        totals.carbs += meal.carbs || 0;
        totals.fat += meal.fat || 0;
        totals.fiber += meal.fiber || 0;

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

    // Calculate water
    const totalWater = waterEntries.reduce(
      (total, entry) => total + entry.amount,
      0
    );

    // ==========================================
    // SCORE COMPONENTS
    // ==========================================

    // Calories = 25 points
    let calorieScore = 0;

    if (profile.dailyCalories > 0) {
      const calorieRatio =
        consumed.calories / profile.dailyCalories;

      if (calorieRatio >= 0.9 && calorieRatio <= 1.1) {
        calorieScore = 25;
      } else if (
        calorieRatio >= 0.75 &&
        calorieRatio < 0.9
      ) {
        calorieScore = 20;
      } else if (
        calorieRatio > 1.1 &&
        calorieRatio <= 1.25
      ) {
        calorieScore = 20;
      } else if (
        calorieRatio >= 0.5 &&
        calorieRatio < 0.75
      ) {
        calorieScore = 15;
      } else {
        calorieScore = 10;
      }
    }

    // Protein = 20 points
    let proteinScore = 0;

    if (profile.proteinTarget > 0) {
      const proteinRatio =
        consumed.protein / profile.proteinTarget;

      if (proteinRatio >= 0.9 && proteinRatio <= 1.1) {
        proteinScore = 20;
      } else if (
        proteinRatio >= 0.75 &&
        proteinRatio < 0.9
      ) {
        proteinScore = 15;
      } else if (
        proteinRatio > 1.1 &&
        proteinRatio <= 1.25
      ) {
        proteinScore = 18;
      } else {
        proteinScore = 10;
      }
    }

    // Carbs = 15 points
    let carbsScore = 0;

    if (profile.carbsTarget > 0) {
      const carbsRatio =
        consumed.carbs / profile.carbsTarget;

      if (carbsRatio >= 0.8 && carbsRatio <= 1.1) {
        carbsScore = 15;
      } else if (
        carbsRatio >= 0.6 &&
        carbsRatio < 0.8
      ) {
        carbsScore = 12;
      } else if (
        carbsRatio > 1.1 &&
        carbsRatio <= 1.25
      ) {
        carbsScore = 12;
      } else {
        carbsScore = 8;
      }
    }

    // Fat = 15 points
    let fatScore = 0;

    if (profile.fatTarget > 0) {
      const fatRatio =
        consumed.fat / profile.fatTarget;

      if (fatRatio >= 0.8 && fatRatio <= 1.1) {
        fatScore = 15;
      } else if (
        fatRatio >= 0.6 &&
        fatRatio < 0.8
      ) {
        fatScore = 12;
      } else if (
        fatRatio > 1.1 &&
        fatRatio <= 1.25
      ) {
        fatScore = 12;
      } else {
        fatScore = 8;
      }
    }

    // Fiber = 15 points
    let fiberScore = 0;

    if (profile.fiberTarget > 0) {
      const fiberRatio =
        consumed.fiber / profile.fiberTarget;

      if (fiberRatio >= 0.9) {
        fiberScore = 15;
      } else if (fiberRatio >= 0.7) {
        fiberScore = 12;
      } else if (fiberRatio >= 0.5) {
        fiberScore = 8;
      } else {
        fiberScore = 5;
      }
    }

    // Water = 10 points
    const waterTarget = 2000;

    let waterScore = 0;

    const waterRatio = totalWater / waterTarget;

    if (waterRatio >= 1) {
      waterScore = 10;
    } else if (waterRatio >= 0.75) {
      waterScore = 8;
    } else if (waterRatio >= 0.5) {
      waterScore = 6;
    } else if (waterRatio >= 0.25) {
      waterScore = 4;
    } else {
      waterScore = 2;
    }

    // ==========================================
    // TOTAL SCORE
    // ==========================================

    const totalScore =
      calorieScore +
      proteinScore +
      carbsScore +
      fatScore +
      fiberScore +
      waterScore;

    // ==========================================
    // SCORE INTERPRETATION
    // ==========================================

    let rating;

    if (totalScore >= 90) {
      rating = "Excellent";
    } else if (totalScore >= 75) {
      rating = "Good";
    } else if (totalScore >= 60) {
      rating = "Fair";
    } else {
      rating = "Needs Improvement";
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,

      date: startOfDay,

      balanceScore: totalScore,

      rating,

      breakdown: {
        calories: {
          score: calorieScore,
          maximum: 25,
          consumed: consumed.calories,
          target: profile.dailyCalories,
        },

        protein: {
          score: proteinScore,
          maximum: 20,
          consumed: consumed.protein,
          target: profile.proteinTarget,
        },

        carbs: {
          score: carbsScore,
          maximum: 15,
          consumed: consumed.carbs,
          target: profile.carbsTarget,
        },

        fat: {
          score: fatScore,
          maximum: 15,
          consumed: consumed.fat,
          target: profile.fatTarget,
        },

        fiber: {
          score: fiberScore,
          maximum: 15,
          consumed: consumed.fiber,
          target: profile.fiberTarget,
        },

        water: {
          score: waterScore,
          maximum: 10,
          consumed: totalWater,
          target: waterTarget,
        },
      },

      nutrition: {
        consumed,
        targets: {
          calories: profile.dailyCalories,
          protein: profile.proteinTarget,
          carbs: profile.carbsTarget,
          fat: profile.fatTarget,
          fiber: profile.fiberTarget,
        },
      },

      hydration: {
        consumed: totalWater,
        target: waterTarget,
      },
    });
  } catch (error) {
    console.error("Balance score error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};

module.exports = {
  getBalanceScore,
};