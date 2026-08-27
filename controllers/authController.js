const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const validatePassword = require("../utils/passwordValidator");

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
    } = req.body;

    // Check required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide first name, last name, email, and password",
      });
    }

    // Validate password
    const passwordErrors = validatePassword(
      password,
      firstName,
      lastName,
      email
    );

    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet the security requirements",
        errors: passwordErrors,
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Never return password
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
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
    const user = await User.findById(req.userId).select(
      "-password"
    );

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

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password with hash
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Successful login
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
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