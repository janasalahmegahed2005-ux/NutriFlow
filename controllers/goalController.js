const Goal = require("../models/Goal");


// ==========================================
// CREATE GOAL
// Protected route
// ==========================================
const createGoal = async (req, res) => {
  try {
    const {
      type,
      targetWeight,
      dailyCalories,
      proteinTarget,
      carbsTarget,
      fatTarget,
    } = req.body;


    // Check if the user already has an active goal
    const existingGoal = await Goal.findOne({
      user: req.userId,
      isActive: true,
    });

    if (existingGoal) {
      return res.status(409).json({
        success: false,
        message: "An active goal already exists",
      });
    }


    // Create the goal
    const goal = new Goal({
      user: req.userId,
      type,
      targetWeight,
      dailyCalories,
      proteinTarget,
      carbsTarget,
      fatTarget,
      isActive: true,
    });


    const savedGoal = await goal.save();


    res.status(201).json({
      success: true,
      message: "Goal created successfully",
      goal: savedGoal,
    });

  } catch (error) {

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid goal data",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    console.error("Create goal error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// GET MY ACTIVE GOAL
// ==========================================
const getMyGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      user: req.userId,
      isActive: true,
    });


    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Active goal not found",
      });
    }


    res.status(200).json({
      success: true,
      goal,
    });

  } catch (error) {

    console.error("Get goal error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// GET ALL MY GOALS
// ==========================================
const getMyGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      user: req.userId,
    }).sort({
      createdAt: -1,
    });


    res.status(200).json({
      success: true,
      count: goals.length,
      goals,
    });

  } catch (error) {

    console.error("Get goals error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// UPDATE MY ACTIVE GOAL
// ==========================================
const updateGoal = async (req, res) => {
  try {
    const {
      type,
      targetWeight,
      dailyCalories,
      proteinTarget,
      carbsTarget,
      fatTarget,
    } = req.body;


    const updatedGoal = await Goal.findOneAndUpdate(
      {
        user: req.userId,
        isActive: true,
      },
      {
        type,
        targetWeight,
        dailyCalories,
        proteinTarget,
        carbsTarget,
        fatTarget,
      },
      {
        new: true,
        runValidators: true,
      }
    );


    if (!updatedGoal) {
      return res.status(404).json({
        success: false,
        message: "Active goal not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      goal: updatedGoal,
    });

  } catch (error) {

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid goal data",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    console.error("Update goal error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// DEACTIVATE MY ACTIVE GOAL
// ==========================================
const deleteGoal = async (req, res) => {
  try {
    const deletedGoal = await Goal.findOneAndUpdate(
      {
        user: req.userId,
        isActive: true,
      },
      {
        isActive: false,
      },
      {
        new: true,
      }
    );


    if (!deletedGoal) {
      return res.status(404).json({
        success: false,
        message: "Active goal not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Goal deactivated successfully",
      goal: deletedGoal,
    });

  } catch (error) {

    console.error("Delete goal error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


module.exports = {
  createGoal,
  getMyGoal,
  getMyGoals,
  updateGoal,
  deleteGoal,
};