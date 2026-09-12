const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const user = await User.findOneAndUpdate(
      { email: "jana.test@example.com" },
      { role: "admin" },
      { new: true }
    ).select("-password");

    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("User is now an admin:");
    console.log({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Failed to make user admin:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

makeAdmin();