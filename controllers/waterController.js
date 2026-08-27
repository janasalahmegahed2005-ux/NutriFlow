const Water = require("../models/Water");

// ==========================================
// ADD WATER
// Protected route
// ==========================================
const addWater = async (req, res) => {
  try {
    const { amount, date } = req.body || {};

    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "Water amount is required",
      });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Water amount must be a positive number",
      });
    }

    const waterEntry = new Water({
      user: req.userId,
      amount,
      date,
    });

    const savedEntry = await waterEntry.save();

    res.status(201).json({
      success: true,
      message: "Water entry added successfully",
      entry: savedEntry,
    });
  } catch (error) {
    console.error("Add water error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// GET WATER HISTORY
// Protected route
// ==========================================
const getWaterHistory = async (req, res) => {
  try {
    const entries = await Water.find({
      user: req.userId,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      entries,
    });
  } catch (error) {
    console.error("Get water history error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// GET TODAY'S WATER INTAKE
// Protected route
// ==========================================
const getTodayWater = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const entries = await Water.find({
      user: req.userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).sort({ date: -1 });

    const totalWater = entries.reduce(
      (total, entry) => total + entry.amount,
      0
    );

    res.status(200).json({
      success: true,
      date: startOfDay,
      totalWater,
      entries,
    });
  } catch (error) {
    console.error("Get today's water error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// DELETE WATER ENTRY
// Protected route
// Only user's own entry
// ==========================================
const deleteWater = async (req, res) => {
  try {
    const deletedEntry = await Water.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!deletedEntry) {
      return res.status(404).json({
        success: false,
        message: "Water entry not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Water entry deleted successfully",
      entry: deletedEntry,
    });
  } catch (error) {
    console.error("Delete water error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


module.exports = {
  addWater,
  getWaterHistory,
  getTodayWater,
  deleteWater,
};