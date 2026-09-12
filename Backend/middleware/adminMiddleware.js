const User = require("../models/User");

const adminOnly = async (req, res, next) => {
  try {
    // Find the logged-in user
    const user = await User.findById(req.userId).select("role");

    // User doesn't exist
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the user is an admin
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // User is an admin
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization failed",
    });
  }
};

module.exports = adminOnly;