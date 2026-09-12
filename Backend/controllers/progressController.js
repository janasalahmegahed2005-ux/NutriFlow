const WeightEntry = require("../models/WeightEntry");
const Goal = require("../models/Goal");
const Meal = require("../models/Meal");


// ==========================================
// ADD WEIGHT ENTRY
// ==========================================
const addWeightEntry = async (req, res) => {
  try {
const { weight, date } = req.body || {};
if (weight === undefined || weight === null) {
  return res.status(400).json({
    success: false,
    message: "Weight is required",
  });
}

    const entry = new WeightEntry({
      user: req.userId,
      weight,
      date,
    });

    const savedEntry = await entry.save();

    res.status(201).json({
      success: true,
      message: "Weight entry added successfully",
      entry: savedEntry,
    });

  } catch (error) {

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid weight data",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    console.error("Add weight entry error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// GET WEIGHT HISTORY
// ==========================================
const getWeightHistory = async (req, res) => {
  try {
    const entries = await WeightEntry.find({
      user: req.userId,
    }).sort({
      date: 1,
    });

    res.status(200).json({
      success: true,
      count: entries.length,
      entries,
    });

  } catch (error) {

    console.error("Get weight history error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// GET CURRENT PROGRESS
// ==========================================
const getProgress = async (req, res) => {
  try {
    // Get active goal
    const goal = await Goal.findOne({
      user: req.userId,
      isActive: true,
    });


    // Get weight history
    const weightEntries = await WeightEntry.find({
      user: req.userId,
    }).sort({
      date: 1,
    });


    // If there is no weight data
    if (weightEntries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No weight entries found",
      });
    }


    const currentWeight =
      weightEntries[weightEntries.length - 1].weight;

    const startingWeight =
      weightEntries[0].weight;


    // ==========================================
    // GOAL PROGRESS
    // ==========================================
let progress = null;

if (goal) {
  const totalChange =
    Math.abs(goal.targetWeight - startingWeight);

  let achievedChange = 0;

  // Weight loss goal
  if (goal.type === "lose") {
    achievedChange =
      startingWeight - currentWeight;

  // Weight gain goal
  } else if (goal.type === "gain") {
    achievedChange =
      currentWeight - startingWeight;

  // Maintain weight goal
  } else if (goal.type === "maintain") {
    achievedChange =
      Math.abs(currentWeight - startingWeight);
  }

  // Don't allow movement in the wrong direction
  achievedChange = Math.max(0, achievedChange);

  let percentage = 0;

  if (totalChange > 0) {
    percentage =
      (achievedChange / totalChange) * 100;
  }

  percentage = Math.min(
    100,
    Math.max(0, percentage)
  );

  progress = {
    goalType: goal.type,
    startingWeight,
    currentWeight,
    targetWeight: goal.targetWeight,
    weightChange:
      currentWeight - startingWeight,
    percentage: Math.round(percentage),
  };
}

    // ==========================================
    // BASIC NUTRITION CONSISTENCY
    // ==========================================

    const meals = await Meal.find({
      user: req.userId,
    });


    let averageCalories = 0;

    if (meals.length > 0) {
      const totalCalories = meals.reduce(
        (sum, meal) => sum + meal.calories,
        0
      );

      averageCalories =
        totalCalories / meals.length;
    }


    res.status(200).json({
      success: true,

      progress,

      weightHistory: weightEntries,

      nutrition: {
        mealsLogged: meals.length,
        averageCaloriesPerMeal:
          Math.round(averageCalories),
      },
    });

  } catch (error) {

    console.error("Get progress error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// DELETE WEIGHT ENTRY
// ==========================================
const deleteWeightEntry = async (req, res) => {
  try {
    const entry = await WeightEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });


    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Weight entry not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Weight entry deleted successfully",
      entry,
    });

  } catch (error) {

    console.error("Delete weight entry error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


module.exports = {
  addWeightEntry,
  getWeightHistory,
  getProgress,
  deleteWeightEntry,
};