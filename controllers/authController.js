const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const validatePassword = require("../utils/passwordValidator");

// ==========================================
// CALCULATE CALORIE TARGET
// Mifflin-St Jeor formula
// ==========================================
const calculateCalorieTarget = (gender, weight, height, dateOfBirth) => {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  let bmr;
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }

  return Math.round(bmr * 1.375);
};

// ==========================================
// CALCULATE MACRO TARGETS
// Based on calorie target and user goal
// ==========================================
const calculateMacroTargets = (calorieTarget, goal) => {
  const goalLower = (goal || '').toLowerCase();

  let proteinPct, carbsPct, fatPct;

  if (
    goalLower.includes('lose') ||
    goalLower.includes('weight loss') ||
    goalLower.includes('slim') ||
    goalLower.includes('cut')
  ) {
    proteinPct = 0.35;
    carbsPct = 0.35;
    fatPct = 0.30;
  } else if (
    goalLower.includes('muscle') ||
    goalLower.includes('bulk') ||
    goalLower.includes('gain') ||
    goalLower.includes('build') ||
    goalLower.includes('strength')
  ) {
    proteinPct = 0.30;
    carbsPct = 0.45;
    fatPct = 0.25;
  } else {
    proteinPct = 0.25;
    carbsPct = 0.45;
    fatPct = 0.30;
  }

  return {
    proteinTarget: Math.round((calorieTarget * proteinPct) / 4),
    carbsTarget: Math.round((calorieTarget * carbsPct) / 4),
    fatTarget: Math.round((calorieTarget * fatPct) / 9),
  };
};

// ==========================================
// REGISTER
// ==========================================
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      gender,
      dateOfBirth,
      weight,
      height,
      goal,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !gender || !dateOfBirth || !weight || !height || !goal) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields including weight, height, and goal",
      });
    }

    const passwordErrors = validatePassword(password, firstName, lastName, email);

    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet the security requirements",
        errors: passwordErrors,
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      firstName,
      lastName,
      email,
      gender,
      dateOfBirth,
      weight: Number(weight),
      height: Number(height),
      goal,
      password: hashedPassword,
      imageUrl: req.file
        ? `/uploads/users/${req.file.filename}`
        : "/uploads/users/default-user.png",
    });

    const savedUser = await newUser.save();

    const calorieTarget = calculateCalorieTarget(
      gender,
      Number(weight),
      Number(height),
      dateOfBirth
    );

    const macroTargets = calculateMacroTargets(calorieTarget, goal);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        gender: savedUser.gender,
        dateOfBirth: savedUser.dateOfBirth,
        weight: savedUser.weight,
        height: savedUser.height,
        goal: savedUser.goal,
        imageUrl: savedUser.imageUrl,
        calorieTarget,
        proteinTarget: macroTargets.proteinTarget,
        carbsTarget: macroTargets.carbsTarget,
        fatTarget: macroTargets.fatTarget,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};

// ==========================================
// GET CURRENT USER
// ==========================================
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};

// ==========================================
// LOGIN
// ==========================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const calorieTarget = calculateCalorieTarget(
      user.gender,
      user.weight,
      user.height,
      user.dateOfBirth
    );

    const macroTargets = calculateMacroTargets(calorieTarget, user.goal);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        weight: user.weight,
        height: user.height,
        goal: user.goal,
        imageUrl: user.imageUrl,
        calorieTarget,
        proteinTarget: macroTargets.proteinTarget,
        carbsTarget: macroTargets.carbsTarget,
        fatTarget: macroTargets.fatTarget,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};

module.exports = {
  registerUser,
  getCurrentUser,
  loginUser,
};