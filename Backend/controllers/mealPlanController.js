const MealPlan = require("../models/MealPlan");

// ==========================================
// CREATE A PLANNED MEAL
// ==========================================
const createMealPlan = async (req, res) => {
  try {
    const {
      name,
      mealType,
      food,
      recipe,
      quantity,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      vitamins,
      date,
    } = req.body;

    const mealPlan = new MealPlan({
      user: req.userId,
      name,
      mealType,
      food,
      recipe,
      quantity,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      vitamins,
      date,
    });

    const savedMealPlan = await mealPlan.save();

    res.status(201).json({
      success: true,
      message: "Meal planned successfully",
      mealPlan: savedMealPlan,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid meal plan data",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    console.error("Create meal plan error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create meal plan",
    });
  }
};


// ==========================================
// GET ALL PLANNED MEALS
// ==========================================
const getMealPlans = async (req, res) => {
  try {
    const { date } = req.query;

    const query = {
      user: req.userId,
    };

    if (date) {
      const parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date",
        });
      }

      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const mealPlans = await MealPlan.find(query)
      .populate("food")
      .populate("recipe")
      .sort({ date: 1, mealType: 1 });

    res.status(200).json({
      success: true,
      count: mealPlans.length,
      mealPlans,
    });
  } catch (error) {
    console.error("Get meal plans error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch meal plans",
    });
  }
};


// ==========================================
// GET ONE PLANNED MEAL
// ==========================================
const getMealPlanById = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      user: req.userId,
    })
      .populate("food")
      .populate("recipe");

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    res.status(200).json({
      success: true,
      mealPlan,
    });
  } catch (error) {
    console.error("Get meal plan error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch meal plan",
    });
  }
};


// ==========================================
// UPDATE A PLANNED MEAL
// ==========================================
const updateMealPlan = async (req, res) => {
  try {
    const {
      name,
      mealType,
      food,
      recipe,
      quantity,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      vitamins,
      date,
    } = req.body;

    const updatedMealPlan = await MealPlan.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },
      {
        name,
        mealType,
        food,
        recipe,
        quantity,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        vitamins,
        date,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Meal plan updated successfully",
      mealPlan: updatedMealPlan,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid meal plan data",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    console.error("Update meal plan error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update meal plan",
    });
  }
};


// ==========================================
// DELETE A PLANNED MEAL
// ==========================================
const deleteMealPlan = async (req, res) => {
  try {
    const deletedMealPlan = await MealPlan.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!deletedMealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Meal plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete meal plan error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete meal plan",
    });
  }
};


module.exports = {
  createMealPlan,
  getMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan,
};