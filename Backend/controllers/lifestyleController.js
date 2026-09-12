const Lifestyle = require("../models/Lifestyle");

// ==========================================
// ADD / UPDATE TODAY'S LIFESTYLE
// Protected route
// ==========================================
const addLifestyle = async (req, res) => {
  try {
    const { sleepHours, activityMinutes, date } = req.body || {};

    // Validate sleep hours
    if (
      sleepHours !== undefined &&
      (typeof sleepHours !== "number" ||
        sleepHours < 0 ||
        sleepHours > 24)
    ) {
      return res.status(400).json({
        success: false,
        message: "Sleep hours must be between 0 and 24",
      });
    }

    // Validate activity minutes
    if (
      activityMinutes !== undefined &&
      (typeof activityMinutes !== "number" ||
        activityMinutes < 0 ||
        activityMinutes > 1440)
    ) {
      return res.status(400).json({
        success: false,
        message: "Activity minutes must be between 0 and 1440",
      });
    }

    if (
      sleepHours === undefined &&
      activityMinutes === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide sleep hours or activity minutes",
      });
    }

    // Use provided date or today
    const entryDate = date ? new Date(date) : new Date();

    if (isNaN(entryDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    // Normalize to the day
    const startOfDay = new Date(entryDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Check if the user already has an entry for that day
    let lifestyle = await Lifestyle.findOne({
      user: req.userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    if (lifestyle) {
      if (sleepHours !== undefined) {
        lifestyle.sleepHours = sleepHours;
      }

      if (activityMinutes !== undefined) {
        lifestyle.activityMinutes = activityMinutes;
      }

      lifestyle.date = startOfDay;

      const updatedLifestyle = await lifestyle.save();

      return res.status(200).json({
        success: true,
        message: "Lifestyle entry updated successfully",
        entry: updatedLifestyle,
      });
    }

    // Create a new entry
    lifestyle = new Lifestyle({
      user: req.userId,
      sleepHours,
      activityMinutes,
      date: startOfDay,
    });

    const savedLifestyle = await lifestyle.save();

    res.status(201).json({
      success: true,
      message: "Lifestyle entry added successfully",
      entry: savedLifestyle,
    });
  } catch (error) {
    console.error("Add lifestyle error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// GET TODAY'S LIFESTYLE
// Protected route
// ==========================================
const getTodayLifestyle = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const lifestyle = await Lifestyle.findOne({
      user: req.userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    res.status(200).json({
      success: true,
      lifestyle: lifestyle || null,
    });
  } catch (error) {
    console.error("Get today's lifestyle error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// GET LIFESTYLE HISTORY
// Protected route
// ==========================================
const getLifestyleHistory = async (req, res) => {
  try {
    const entries = await Lifestyle.find({
      user: req.userId,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      entries,
    });
  } catch (error) {
    console.error("Get lifestyle history error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


// ==========================================
// DELETE LIFESTYLE ENTRY
// Protected + owner only
// ==========================================
const deleteLifestyle = async (req, res) => {
  try {
    const deletedEntry = await Lifestyle.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!deletedEntry) {
      return res.status(404).json({
        success: false,
        message: "Lifestyle entry not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lifestyle entry deleted successfully",
      entry: deletedEntry,
    });
  } catch (error) {
    console.error("Delete lifestyle error:", error);

    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};


module.exports = {
  addLifestyle,
  getTodayLifestyle,
  getLifestyleHistory,
  deleteLifestyle,
};