const User = require("../models/User");
const Meal = require("../models/Meal");
const MealPlan = require("../models/MealPlan");
const NutritionProfile = require("../models/NutritionProfile");
const Goal = require("../models/Goal");
const Lifestyle = require("../models/Lifestyle");
const Water = require("../models/Water");
const WeightEntry = require("../models/WeightEntry");
const Recipe = require("../models/Recipe");


// ==========================================
// GET ALL USERS
// ==========================================

const getAllUsers = async (req, res) => {
  try {

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {

    console.error(
      "Get all users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
    });

  }
};


// ==========================================
// GET USER DETAILS + JOURNEY
// ==========================================

const getUserDetails = async (req, res) => {
  try {

    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get all user-related data
    const [
      meals,
      mealPlans,
      nutritionProfile,
      goals,
      lifestyle,
      water,
      weightEntries,
    ] = await Promise.all([
      Meal.find({ user: userId })
        .sort({ date: -1 }),

      MealPlan.find({ user: userId })
        .sort({ date: -1 }),

      NutritionProfile.findOne({
        user: userId,
      }),

      Goal.find({ user: userId })
        .sort({ createdAt: -1 }),

      Lifestyle.find({ user: userId })
        .sort({ date: -1 }),

      Water.find({ user: userId })
        .sort({ date: -1 }),

      WeightEntry.find({ user: userId })
        .sort({ date: -1 }),
    ]);

    return res.status(200).json({
      success: true,

      user,

      journey: {
        meals,
        mealPlans,
        nutritionProfile,
        goals,
        lifestyle,
        water,
        weightEntries,
      },
    });

  } catch (error) {

    console.error(
      "Get user details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user details",
    });

  }
};

// ==========================================
// DELETE USER ACCOUNT
// ==========================================

const deleteUser = async (req, res) => {
  try {

    const { userId } = req.params;


    // Check that the target user exists
    const user = await User.findById(userId);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }


    // Admin accounts cannot delete other admin accounts
    if (user.role === "admin") {

      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot delete other admin accounts.",
      });

    }


    // Delete all user-owned data
    await Promise.all([

      Meal.deleteMany({
        user: userId,
      }),

      MealPlan.deleteMany({
        user: userId,
      }),

      NutritionProfile.deleteOne({
        user: userId,
      }),

      Goal.deleteMany({
        user: userId,
      }),

      Lifestyle.deleteMany({
        user: userId,
      }),

      Water.deleteMany({
        user: userId,
      }),

      WeightEntry.deleteMany({
        user: userId,
      }),

      Recipe.deleteMany({
        createdBy: userId,
      }),

    ]);


    // Finally delete the user account
    await User.findByIdAndDelete(userId);


    return res.status(200).json({
      success: true,
      message: "User account and associated data deleted successfully.",
    });

  } catch (error) {

    console.error(
      "Delete user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete user account",
    });

  }
};


module.exports = {
  getAllUsers,
  getUserDetails,
  deleteUser,
};
