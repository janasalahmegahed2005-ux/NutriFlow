const { body, validationResult } = require("express-validator");

// ==========================================
// FOOD VALIDATION RULES
// ==========================================

const validateFood = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Food name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Food name must be between 2 and 100 characters")
    .escape(),

  body("calories")
    .isFloat({ min: 0, max: 10000 })
    .withMessage("Calories must be a valid number between 0 and 10000")
    .toFloat(),

  body("protein")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Protein must be a valid number between 0 and 1000")
    .toFloat(),

  body("carbs")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Carbs must be a valid number between 0 and 1000")
    .toFloat(),

  body("fat")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Fat must be a valid number between 0 and 1000")
    .toFloat(),

  body("fiber")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Fiber must be a valid number between 0 and 1000")
    .toFloat(),

  body("vitamins")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Vitamins must be an array with a maximum of 20 items"),

  body("vitamins.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each vitamin must be between 1 and 50 characters")
    .escape(),
];


// ==========================================
// VALIDATION ERROR HANDLER
// ==========================================

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};



// ==========================================
// FOOD UPDATE VALIDATION RULES
// Fields are optional, but if provided,
// they must be valid.
// ==========================================

const validateFoodUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Food name must be between 2 and 100 characters")
    .escape(),

  body("calories")
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage("Calories must be a valid number between 0 and 10000")
    .toFloat(),

  body("protein")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Protein must be a valid number between 0 and 1000")
    .toFloat(),

  body("carbs")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Carbs must be a valid number between 0 and 1000")
    .toFloat(),

  body("fat")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Fat must be a valid number between 0 and 1000")
    .toFloat(),

  body("fiber")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Fiber must be a valid number between 0 and 1000")
    .toFloat(),

  body("vitamins")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Vitamins must be an array with a maximum of 20 items"),

  body("vitamins.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each vitamin must be between 1 and 50 characters")
    .escape(),
];


// ==========================================
// NUTRITION PROFILE VALIDATION
// ==========================================

const validateNutritionProfile = [
  body("age")
    .isInt({ min: 13, max: 120 })
    .withMessage("Age must be between 13 and 120")
    .toInt(),

  body("gender")
    .isIn(["male", "female"])
    .withMessage("Gender must be male or female"),

  body("height")
    .isFloat({ min: 50, max: 250 })
    .withMessage("Height must be between 50 and 250 cm")
    .toFloat(),

  body("weight")
    .isFloat({ min: 20, max: 500 })
    .withMessage("Weight must be between 20 and 500 kg")
    .toFloat(),

  body("activityLevel")
    .isIn([
      "sedentary",
      "light",
      "moderate",
      "active",
      "very_active",
    ])
    .withMessage("Invalid activity level"),

  body("goal")
    .isIn([
      "lose_weight",
      "maintain_weight",
      "gain_weight",
    ])
    .withMessage("Invalid nutrition goal"),
];

// ==========================================
// MEAL VALIDATION
// ==========================================

const validateMeal = [

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Meal name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Meal name must be between 2 and 100 characters")
    .escape(),

  body("mealType")
    .isIn([
      "breakfast",
      "lunch",
      "dinner",
      "snack",
    ])
    .withMessage(
      "Meal type must be breakfast, lunch, dinner, or snack"
    ),

  body("food")
    .optional()
    .isMongoId()
    .withMessage("Food must be a valid food ID"),

  body("quantity")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Quantity must be a valid positive number")
    .toFloat(),

  body("calories")
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage("Calories must be a valid number between 0 and 10000")
    .toFloat(),

  body("protein")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Protein must be a valid number between 0 and 1000")
    .toFloat(),

  body("carbs")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Carbs must be a valid number between 0 and 1000")
    .toFloat(),

  body("fat")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Fat must be a valid number between 0 and 1000")
    .toFloat(),

  body("fiber")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Fiber must be a valid number between 0 and 1000")
    .toFloat(),

  body("vitamins")
    .optional()
    .isArray({ max: 20 })
    .withMessage(
      "Vitamins must be an array with a maximum of 20 items"
    ),

  body("vitamins.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(
      "Each vitamin must be between 1 and 50 characters"
    )
    .escape(),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid date")
    .toDate(),
];


module.exports = {
  validateFood,
  validateFoodUpdate,
  validateNutritionProfile,
  validateMeal,
  handleValidationErrors,
};