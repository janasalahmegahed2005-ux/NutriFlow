const NutritionProfile = require("../models/NutritionProfile");

const {
  calculateBMR,
  calculateDailyCalories,
  calculateMacros,
} = require("../utils/nutritionCalculator");


// ==========================================
// CREATE NUTRITION PROFILE
// ==========================================
const createNutritionProfile = async (req, res) => {
  try {
    const {
      age,
      gender,
      height,
      weight,
      activityLevel,
      goal,
    } = req.body;


    // Check if the user already has a profile
    const existingProfile = await NutritionProfile.findOne({
      user: req.userId,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Nutrition profile already exists",
      });
    }


    // Calculate nutrition targets
    const bmr = calculateBMR({
      age,
      height,
      weight,
      gender,
    });

    const dailyCalories = calculateDailyCalories({
      bmr,
      activityLevel,
      goal,
    });

    const {
      proteinTarget,
      carbsTarget,
      fatTarget,
      fiberTarget,
    } = calculateMacros(
      dailyCalories,
      weight
    );


    // Create profile
    const profile = new NutritionProfile({
      user: req.userId,
      age,
      gender,
      height,
      weight,
      activityLevel,
      goal,
      dailyCalories,
      proteinTarget,
      carbsTarget,
      fatTarget,
      fiberTarget,
    });

    const savedProfile = await profile.save();


    res.status(201).json({
      success: true,
      message: "Nutrition profile created successfully",
      profile: savedProfile,
    });

  } catch (error) {

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid nutrition profile data",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    console.error("Create nutrition profile error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// GET MY NUTRITION PROFILE
// ==========================================
const getNutritionProfile = async (req, res) => {
  try {
    const profile = await NutritionProfile.findOne({
      user: req.userId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Nutrition profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });

  } catch (error) {

    console.error("Get nutrition profile error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// UPDATE MY NUTRITION PROFILE
// ==========================================
const updateNutritionProfile = async (req, res) => {
  try {
    const {
      age,
      gender,
      height,
      weight,
      activityLevel,
      goal,
    } = req.body;


    // Recalculate nutrition targets
    const bmr = calculateBMR({
      age,
      height,
      weight,
      gender,
    });

    const dailyCalories = calculateDailyCalories({
      bmr,
      activityLevel,
      goal,
    });

    const {
      proteinTarget,
      carbsTarget,
      fatTarget,
      fiberTarget,
    } = calculateMacros(
      dailyCalories,
      weight
    );


    // Update only the logged-in user's profile
    const updatedProfile =
      await NutritionProfile.findOneAndUpdate(
        {
          user: req.userId,
        },
        {
          age,
          gender,
          height,
          weight,
          activityLevel,
          goal,
          dailyCalories,
          proteinTarget,
          carbsTarget,
          fatTarget,
          fiberTarget,
        },
        {
          new: true,
          runValidators: true,
        }
      );


    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "Nutrition profile not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Nutrition profile updated successfully",
      profile: updatedProfile.toObject(),
    });

  } catch (error) {

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid nutrition profile data",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    console.error("Update nutrition profile error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// DELETE MY NUTRITION PROFILE
// ==========================================
const deleteNutritionProfile = async (req, res) => {
  try {
    const deletedProfile =
      await NutritionProfile.findOneAndDelete({
        user: req.userId,
      });

    if (!deletedProfile) {
      return res.status(404).json({
        success: false,
        message: "Nutrition profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Nutrition profile deleted successfully",
    });

  } catch (error) {

    console.error("Delete nutrition profile error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


module.exports = {
  createNutritionProfile,
  getNutritionProfile,
  updateNutritionProfile,
  deleteNutritionProfile,
};