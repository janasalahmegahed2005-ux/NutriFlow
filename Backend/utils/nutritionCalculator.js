// Calculate BMR using the Mifflin-St Jeor equation
const calculateBMR = ({ age, height, weight, gender }) => {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }

  return 10 * weight + 6.25 * height - 5 * age - 161;
};


// Activity multipliers
const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};


// Calculate daily calorie target
const calculateDailyCalories = ({
  bmr,
  activityLevel,
  goal,
}) => {
  const multiplier = activityMultipliers[activityLevel];

  if (!multiplier) {
    throw new Error("Invalid activity level");
  }

  const tdee = bmr * multiplier;

  let dailyCalories = tdee;

  if (goal === "lose_weight") {
    dailyCalories = tdee - 500;
  }

  if (goal === "gain_weight") {
    dailyCalories = tdee + 300;
  }

  return Math.round(dailyCalories);
};


// Calculate macro targets
const calculateMacros = (dailyCalories, weight) => {
  // Protein: approximately 1.6g per kg
  const proteinTarget = Math.round(weight * 1.6);

  // Fat: approximately 25% of calories
  const fatTarget = Math.round(
    (dailyCalories * 0.25) / 9
  );

  // Remaining calories go to carbohydrates
  const proteinCalories = proteinTarget * 4;
  const fatCalories = fatTarget * 9;

  const remainingCalories =
    dailyCalories - proteinCalories - fatCalories;

  const carbsTarget = Math.max(
    0,
    Math.round(remainingCalories / 4)
  );

  // Fiber: approximately 14g per 1000 calories
  const fiberTarget = Math.round(
    (dailyCalories / 1000) * 14
  );

  return {
    proteinTarget,
    carbsTarget,
    fatTarget,
    fiberTarget,
  };
};


module.exports = {
  calculateBMR,
  calculateDailyCalories,
  calculateMacros,
};