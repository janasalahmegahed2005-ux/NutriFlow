const mongoose = require("mongoose");

const Meal = require("../models/Meal");
const Food = require("../models/Food");

// ==========================================
// HELPER — CHECK VALID MONGODB ID
// ==========================================
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


// ==========================================
// CREATE A NEW MEAL
// ==========================================
const createMeal = async (req, res) => {
  try {
    let {
      name,
      mealType,
      food,
      quantity,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      vitamins,
      date,
    } = req.body;


    // ==========================================
    // VALIDATE FOOD ID
    // ==========================================

    if (food && !isValidObjectId(food)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }


    // ==========================================
    // CALCULATE NUTRITION FROM FOOD
    // ==========================================

    if (food) {
      if (
        quantity === undefined ||
        typeof quantity !== "number" ||
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0 when using a food",
        });
      }

      const selectedFood = await Food.findById(food);

      if (!selectedFood) {
        return res.status(404).json({
          success: false,
          message: "Food not found",
        });
      }

      const multiplier = quantity / 100;

      calories = selectedFood.calories * multiplier;
      protein = selectedFood.protein * multiplier;
      carbs = selectedFood.carbs * multiplier;
      fat = selectedFood.fat * multiplier;
      fiber = selectedFood.fiber * multiplier;
      vitamins = selectedFood.vitamins || [];
    }


    // ==========================================
    // CUSTOM MEAL
    // ==========================================

    if (!food) {
      const numericFields = {
        calories,
        protein,
        carbs,
        fat,
        fiber,
      };

      for (const [field, value] of Object.entries(numericFields)) {
        if (
          typeof value !== "number" ||
          !Number.isFinite(value)
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a valid number`,
          });
        }

        if (value < 0) {
          return res.status(400).json({
            success: false,
            message: `${field} cannot be negative`,
          });
        }
      }
    }


    // ==========================================
    // CREATE MEAL
    // ==========================================

    const newMeal = new Meal({
      user: req.userId,
      name,
      food,
      quantity,
      mealType,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      vitamins,
      date,
    });

    const savedMeal = await newMeal.save();

    res.status(201).json({
      success: true,
      message: "Meal created successfully",
      meal: savedMeal,
    });

  } catch (error) {

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid meal data",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    console.error("Create meal error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create meal",
    });
  }
};


// ==========================================
// GET ALL MEALS FOR LOGGED-IN USER
// ==========================================
const getMeals = async (req, res) => {
  try {
    const { date } = req.query;

    const query = {
      user: req.userId,
    };


    // Filter by date if provided
    if (date) {
      const parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date",
        });
      }

      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }


    const meals = await Meal.find(query)
      .populate("food")
      .sort({ date: -1 });


    res.status(200).json({
      success: true,
      count: meals.length,
      meals,
    });

  } catch (error) {

    console.error("Get meals error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch meals",
    });
  }
};


// ==========================================
// GET ONE MEAL BY ID
// User can only access their own meal
// ==========================================
const getMealById = async (req, res) => {

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid meal ID",
    });
  }

  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.userId,
    }).populate("food");


    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found",
      });
    }


    res.status(200).json({
      success: true,
      meal,
    });

  } catch (error) {

    console.error("Get meal error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch meal",
    });
  }
};


// ==========================================
// UPDATE ONE MEAL BY ID
// ==========================================
const updateMeal = async (req, res) => {

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid meal ID",
    });
  }

  try {
    let {
      name,
      food,
      quantity,
      mealType,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      vitamins,
      date,
    } = req.body;


    // ==========================================
    // IF FOOD IS PROVIDED
    // RECALCULATE NUTRITION
    // ==========================================

    if (food) {

      if (!isValidObjectId(food)) {
        return res.status(400).json({
          success: false,
          message: "Invalid food ID",
        });
      }


      if (
        quantity === undefined ||
        typeof quantity !== "number" ||
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0 when using a food",
        });
      }


      const selectedFood = await Food.findById(food);

      if (!selectedFood) {
        return res.status(404).json({
          success: false,
          message: "Food not found",
        });
      }


      const multiplier = quantity / 100;

      calories = selectedFood.calories * multiplier;
      protein = selectedFood.protein * multiplier;
      carbs = selectedFood.carbs * multiplier;
      fat = selectedFood.fat * multiplier;
      fiber = selectedFood.fiber * multiplier;
      vitamins = selectedFood.vitamins || [];
    }


    // ==========================================
    // CUSTOM MEAL
    // ==========================================

    if (!food) {
      const numericFields = {
        calories,
        protein,
        carbs,
        fat,
        fiber,
      };


      for (const [field, value] of Object.entries(numericFields)) {

        if (
          value !== undefined &&
          (
            typeof value !== "number" ||
            !Number.isFinite(value)
          )
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a valid number`,
          });
        }


        if (value !== undefined && value < 0) {
          return res.status(400).json({
            success: false,
            message: `${field} cannot be negative`,
          });
        }
      }
    }


    // ==========================================
    // UPDATE ONLY THE USER'S OWN MEAL
    // ==========================================

    const updatedMeal = await Meal.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },
      {
        name,
        food,
        quantity,
        mealType,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        vitamins,
        date,
      },
      {
        new: true,
        runValidators: true,
      }
    );


    if (!updatedMeal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Meal updated successfully",
      meal: updatedMeal,
    });

  } catch (error) {

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid meal data",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }


    console.error("Update meal error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update meal",
    });
  }
};


// ==========================================
// DELETE ONE MEAL BY ID
// ==========================================
const deleteMeal = async (req, res) => {

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid meal ID",
    });
  }

  try {
    const deletedMeal = await Meal.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });


    if (!deletedMeal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Meal deleted successfully",
      meal: deletedMeal,
    });

  } catch (error) {

    console.error("Delete meal error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete meal",
    });
  }
};


module.exports = {
  createMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal,
};