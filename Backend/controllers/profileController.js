const NutritionProfile = require("../models/NutritionProfile");

const User = require("../models/User");
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


    const existingProfile =
      await NutritionProfile.findOne({
        user: req.userId,
      });


    if (existingProfile) {

      return res.status(409).json({
        success: false,
        message: "Nutrition profile already exists",
      });

    }


    const bmr =
      calculateBMR({
        age,
        height,
        weight,
        gender,
      });


    const dailyCalories =
      calculateDailyCalories({
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


    const profile =
      new NutritionProfile({

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


    const savedProfile =
      await profile.save();


    res.status(201).json({

      success: true,

      message:
        "Nutrition profile created successfully",

      profile:
        savedProfile,

    });


  } catch (error) {

    if (error.name === "ValidationError") {

      return res.status(400).json({

        success: false,

        message:
          "Invalid nutrition profile data",

        errors:
          Object.values(error.errors).map(
            (err) => err.message
          ),

      });

    }


    console.error(
      "Create nutrition profile error:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        "An internal server error occurred",

    });

  }

};



// ==========================================
// GET MY NUTRITION PROFILE
// ==========================================

const getNutritionProfile = async (req, res) => {

  try {

    // Try to find the user's existing nutrition profile

    let profile =
      await NutritionProfile.findOne({
        user: req.userId,
      });


    console.log(
      "🔥 PROFILE FOUND:",
      profile
    );

    console.log(
      "🔥 USER ID:",
      req.userId
    );


    // If no profile exists, create one automatically

    if (!profile) {

      console.log(
        "🔥 NO PROFILE FOUND - CREATING ONE NOW..."
      );


      const user =
        await User.findById(
          req.userId
        );


      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "User not found",

        });

      }


      // Calculate age from date of birth

      const today =
        new Date();

      const birthDate =
        new Date(
          user.dateOfBirth
        );


      let age =
        today.getFullYear() -
        birthDate.getFullYear();


      const monthDifference =
        today.getMonth() -
        birthDate.getMonth();


      if (
        monthDifference < 0 ||
        (
          monthDifference === 0 &&
          today.getDate() <
          birthDate.getDate()
        )
      ) {

        age--;

      }


      // Safe defaults

      const activityLevel =
        "moderate";

      const nutritionGoal =
        "maintain_weight";


      // Calculate nutrition targets

      const bmr =
        calculateBMR({

          age,

          height:
            user.height,

          weight:
            user.weight,

          gender:
            user.gender,

        });


      const dailyCalories =
        calculateDailyCalories({

          bmr,

          activityLevel,

          goal:
            nutritionGoal,

        });


      const {
        proteinTarget,
        carbsTarget,
        fatTarget,
        fiberTarget,
      } = calculateMacros(
        dailyCalories,
        user.weight
      );


      // Create the missing nutrition profile

      profile =
        new NutritionProfile({

          user:
            req.userId,

          age,

          gender:
            user.gender,

          height:
            user.height,

          weight:
            user.weight,

          activityLevel,

          goal:
            nutritionGoal,

          dailyCalories,

          proteinTarget,

          carbsTarget,

          fatTarget,

          fiberTarget,

        });


      await profile.save();


      console.log(
        "🔥 NEW NUTRITION PROFILE CREATED:",
        profile._id
      );

    }


    return res.status(200).json({

      success: true,

      profile,

    });


  } catch (error) {

    console.error(
      "Get nutrition profile error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "An internal server error occurred",

    });

  }

};



// ==========================================
// UPDATE MY NUTRITION PROFILE + USER
// ==========================================

const updateNutritionProfile = async (req, res) => {

  try {

    const {
      age,
      gender,
      height,
      weight,
      activityLevel,
      nutritionGoal,

      firstName,
      lastName,
      username,
      dateOfBirth,

      // Free-text personal goal stored in User
      goal,

    } = req.body;


    // ==========================================
    // GET CURRENT USER
    // ==========================================

    const user =
      await User.findById(
        req.userId
      );


    if (!user) {

      return res.status(404).json({

        success: false,

        message:
          "User not found",

      });

    }


    // ==========================================
    // GET CURRENT NUTRITION PROFILE
    // ==========================================

    const profile =
      await NutritionProfile.findOne({

        user:
          req.userId,

      });


    if (!profile) {

      return res.status(404).json({

        success: false,

        message:
          "Nutrition profile not found",

      });

    }


    // ==========================================
    // UPDATE USER INFORMATION
    // ==========================================

    if (firstName !== undefined) {

      user.firstName =
        firstName;

    }


    if (lastName !== undefined) {

      user.lastName =
        lastName;

    }


    // ==========================================
    // UPDATE USERNAME
    // ==========================================

    if (username !== undefined) {

      const cleanUsername =
        username
          .trim()
          .toLowerCase();


      // Validate username format

      if (
        cleanUsername.length < 3 ||
        cleanUsername.length > 30 ||
        !/^(?=.*[A-Za-z]).+$/.test(
          cleanUsername
        )
      ) {

        return res.status(400).json({

          success: false,

          field:
            "username",

          message:
            "Username must be at least 3 characters, no more than 30 characters, and contain at least one letter.",

        });

      }


      // Check if another user already has this username

      const existingUsername =
        await User.findOne({

          username:
            cleanUsername,

          _id:
            { $ne: req.userId },

        });


      if (existingUsername) {

        return res.status(409).json({

          success: false,

          field:
            "username",

          message:
            "This username isn't available. Please choose another username.",

        });

      }


      user.username =
        cleanUsername;

    }


    if (gender !== undefined) {

      user.gender =
        gender;

    }


    if (dateOfBirth !== undefined) {

      user.dateOfBirth =
        dateOfBirth;

    }


    if (height !== undefined) {

      user.height =
        height;

    }


    if (weight !== undefined) {

      user.weight =
        weight;

    }


    if (goal !== undefined) {

      user.goal =
        goal;

    }


    // ==========================================
    // DETERMINE FINAL NUTRITION VALUES
    // ==========================================

    const finalGender =
      gender !== undefined
        ? gender
        : profile.gender;


    const finalHeight =
      height !== undefined
        ? height
        : profile.height;


    const finalWeight =
      weight !== undefined
        ? weight
        : profile.weight;


    const finalActivityLevel =
      activityLevel !== undefined
        ? activityLevel
        : profile.activityLevel;


    const finalNutritionGoal =
      nutritionGoal !== undefined
        ? nutritionGoal
        : profile.goal;


    // ==========================================
    // CALCULATE AGE
    // ==========================================

    let finalAge;


    if (dateOfBirth !== undefined) {

      const birthDate =
        new Date(
          dateOfBirth
        );

      const today =
        new Date();


      finalAge =
        today.getFullYear() -
        birthDate.getFullYear();


      const monthDifference =
        today.getMonth() -
        birthDate.getMonth();


      if (
        monthDifference < 0 ||
        (
          monthDifference === 0 &&
          today.getDate() <
          birthDate.getDate()
        )
      ) {

        finalAge--;

      }

    }

    else if (age !== undefined) {

      finalAge =
        age;

    }

    else {

      finalAge =
        profile.age;

    }


    // ==========================================
    // CALCULATE NEW NUTRITION TARGETS
    // ==========================================

    const bmr =
      calculateBMR({

        age:
          finalAge,

        height:
          finalHeight,

        weight:
          finalWeight,

        gender:
          finalGender,

      });


    const dailyCalories =
      calculateDailyCalories({

        bmr,

        activityLevel:
          finalActivityLevel,

        goal:
          finalNutritionGoal,

      });


    const {
      proteinTarget,
      carbsTarget,
      fatTarget,
      fiberTarget,
    } = calculateMacros(
      dailyCalories,
      finalWeight
    );


    // ==========================================
    // UPDATE NUTRITION PROFILE
    // ==========================================

    profile.age =
      finalAge;

    profile.gender =
      finalGender;

    profile.height =
      finalHeight;

    profile.weight =
      finalWeight;

    profile.activityLevel =
      finalActivityLevel;

    profile.goal =
      finalNutritionGoal;


    profile.dailyCalories =
      dailyCalories;

    profile.proteinTarget =
      proteinTarget;

    profile.carbsTarget =
      carbsTarget;

    profile.fatTarget =
      fatTarget;

    profile.fiberTarget =
      fiberTarget;


    // ==========================================
    // SAVE BOTH
    // ==========================================

    await user.save();

    await profile.save();


    // ==========================================
    // RESPONSE
    // ==========================================

    const safeUser =
      user.toObject();


    delete safeUser.password;


    res.status(200).json({

      success: true,

      message:
        "Settings updated successfully",

      user:
        safeUser,

      profile:
        profile.toObject(),

    });


  } catch (error) {

    // ==========================================
    // DUPLICATE USERNAME
    // ==========================================

    if (error.code === 11000) {

      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];


      if (
        duplicateField ===
        "username"
      ) {

        return res.status(409).json({

          success: false,

          field:
            "username",

          message:
            "This username isn't available. Please choose another username.",

        });

      }

    }


    // ==========================================
    // MONGOOSE VALIDATION ERROR
    // ==========================================

    if (
      error.name ===
      "ValidationError"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid profile data",

        errors:
          Object.values(
            error.errors
          ).map(
            (err) =>
              err.message
          ),

      });

    }


    console.error(
      "Update nutrition profile error:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        "An internal server error occurred",

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

        user:
          req.userId,

      });


    if (!deletedProfile) {

      return res.status(404).json({

        success: false,

        message:
          "Nutrition profile not found",

      });

    }


    res.status(200).json({

      success: true,

      message:
        "Nutrition profile deleted successfully",

    });


  } catch (error) {

    console.error(
      "Delete nutrition profile error:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        "An internal server error occurred",

    });

  }

};



// ==========================================
// EXPORT
// ==========================================

module.exports = {

  createNutritionProfile,

  getNutritionProfile,

  updateNutritionProfile,

  deleteNutritionProfile,

};