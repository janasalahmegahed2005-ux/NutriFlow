const Meal = require("../models/Meal");
const NutritionProfile = require("../models/NutritionProfile");
const Water = require("../models/Water");

// ==========================================
// GET TODAY'S NUTRITION INSIGHTS
// Protected route
// ==========================================
const getInsights = async (req, res) => {
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

    // Calculate total water
    const totalWater = waterEntries.reduce(
      (total, entry) => total + entry.amount,
      0
    );

    const insights = [];

    // ==========================================
    // CALORIE INSIGHTS
    // ==========================================

    const remainingCalories =
      profile.dailyCalories - consumed.calories;

    if (remainingCalories > 0) {
      insights.push({
        type: "calories",
        level: "info",
        message: `You have ${Math.round(
          remainingCalories
        )} calories remaining today.`,
      });
    } else {
      insights.push({
        type: "calories",
        level: "warning",
        message:
          "You have reached or exceeded your daily calorie target.",
      });
    }

    // ==========================================
    // PROTEIN INSIGHTS
    // ==========================================

    const proteinPercentage =
      profile.proteinTarget > 0
        ? (consumed.protein / profile.proteinTarget) * 100
        : 0;

    if (proteinPercentage >= 80 && proteinPercentage <= 110) {
      insights.push({
        type: "protein",
        level: "positive",
        message:
          "Your protein intake is close to your daily target.",
      });
    } else if (proteinPercentage < 80) {
      insights.push({
        type: "protein",
        level: "warning",
        message:
          "Your protein intake is below your daily target.",
      });
    }

    // ==========================================
    // FIBER INSIGHTS
    // ==========================================

    const fiberPercentage =
      profile.fiberTarget > 0
        ? (consumed.fiber / profile.fiberTarget) * 100
        : 0;

    if (fiberPercentage < 70) {
      insights.push({
        type: "fiber",
        level: "warning",
        message:
          "Your fiber intake is below your daily target.",
      });
    } else if (fiberPercentage >= 70) {
      insights.push({
        type: "fiber",
        level: "positive",
        message:
          "Your fiber intake is on track.",
      });
    }

    // ==========================================
    // CARBOHYDRATE INSIGHTS
    // ==========================================

    if (
      profile.carbsTarget > 0 &&
      consumed.carbs > profile.carbsTarget * 1.1
    ) {
      insights.push({
        type: "carbs",
        level: "warning",
        message:
          "Your carbohydrate intake is above your daily target.",
      });
    }

    // ==========================================
    // FAT INSIGHTS
    // ==========================================

    if (
      profile.fatTarget > 0 &&
      consumed.fat > profile.fatTarget * 1.1
    ) {
      insights.push({
        type: "fat",
        level: "warning",
        message:
          "Your fat intake is above your daily target.",
      });
    }

    // ==========================================
    // WATER INSIGHTS
    // ==========================================

    // Simple default hydration target:
    // 2000 ml per day
    const waterTarget = 2000;

    if (totalWater < 500) {
      insights.push({
        type: "water",
        level: "warning",
        message:
          "Very little water has been logged today.",
      });
    } else if (totalWater >= waterTarget) {
      insights.push({
        type: "water",
        level: "positive",
        message:
          "You have reached your daily water target.",
      });
    } else {
      insights.push({
        type: "water",
        level: "info",
        message: `You have logged ${Math.round(
          totalWater
        )} ml of water today.`,
      });
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,

      date: startOfDay,

      insights,

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
    console.error("Get insights error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};

module.exports = {
  getInsights,
};