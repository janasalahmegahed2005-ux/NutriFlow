// ==========================================
// USDA NUTRITION HELPER
// Converts USDA nutrient data into the
// format used by NutriFlow
// ==========================================

const getNutrientValue = (nutrients, nutrientId) => {
  const nutrient = nutrients.find(
    (item) => item.nutrientId === nutrientId
  );

  return nutrient ? nutrient.value : 0;
};

const normalizeUSDANutrition = (food) => {
  const nutrients = food.foodNutrients || [];

  return {
    fdcId: food.fdcId,
    name: food.description,
    source: "usda",

    dataType: food.dataType || null,

    brandOwner: food.brandOwner || null,

    servingSize: food.servingSize || null,
    servingSizeUnit: food.servingSizeUnit || null,

    nutrition: {
calories:
  getNutrientValue(nutrients, 1008) ||
  getNutrientValue(nutrients, 2047) ||
  getNutrientValue(nutrients, 2048),
  protein: getNutrientValue(nutrients, 1003),
  carbs: getNutrientValue(nutrients, 1005),
  fat: getNutrientValue(nutrients, 1004),
  fiber: getNutrientValue(nutrients, 1079),
    },

    vitamins: nutrients
      .filter((nutrient) =>
        nutrient.nutrientName?.toLowerCase().includes("vitamin")
      )
      .map((nutrient) => nutrient.nutrientName),

    minerals: nutrients
      .filter((nutrient) =>
        [
          "calcium",
          "iron",
          "magnesium",
          "phosphorus",
          "potassium",
          "sodium",
          "zinc",
          "selenium",
        ].some((mineral) =>
          nutrient.nutrientName?.toLowerCase().includes(mineral)
        )
      )
      .map((nutrient) => ({
        name: nutrient.nutrientName,
        value: nutrient.value,
        unit: nutrient.unitName,
      })),
  };
};

module.exports = {
  normalizeUSDANutrition,
};