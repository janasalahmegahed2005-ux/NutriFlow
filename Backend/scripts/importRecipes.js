const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const Recipe = require("../models/Recipe");

const CSV_FILE = "C:\\Users\\janas\\Downloads\\archive\\recipes.csv";

// How many recipes we import.
// Start small so we can test everything safely.
const MAX_RECIPES = 1000;

const recipes = [];

/*
  Convert values such as:
  "500"
  "500.5 kcal"
  "12g"
  into numbers.
*/
function parseNumber(value) {
  if (value === undefined || value === null) {
    return 0;
  }

  const number = parseFloat(
    String(value).replace(/[^0-9.-]/g, "")
  );

  return Number.isFinite(number) ? number : 0;
}

/*
  Convert the ingredient arrays stored in the CSV.

  Example:
  ["1 cup", "2", "3"]
  +
  ["Rice", "Eggs", "Tomato"]

  becomes:

  [
    {
      name: "Rice",
      quantity: "1 cup"
    },
    ...
  ]
*/
function parseCsvArray(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    // Some CSV rows may not contain valid JSON.
  }

  return [];
}

/*
  Clean recipe instructions.
*/
function parseInstructions(value) {
  if (!value) {
    return "";
  }

  const instructions = parseCsvArray(value);

  if (instructions.length > 0) {
    return instructions
      .map((step) => String(step).trim())
      .filter(Boolean)
      .map((step, index) => `${index + 1}. ${step}`)
      .join("\n");
  }

  return String(value).trim();
}

/*
  Convert Food.com category into one of our
  NutriFlow meal types.
*/
function getMealType(category, keywords) {
  const text = `${category || ""} ${keywords || ""}`
    .toLowerCase();

  if (
    text.includes("breakfast") ||
    text.includes("brunch")
  ) {
    return "breakfast";
  }

  if (text.includes("lunch")) {
    return "lunch";
  }

  if (
    text.includes("dessert") ||
    text.includes("sweet")
  ) {
    return "snack";
  }

  return "dinner";
}

/*
  Create a simple ingredient representation.

  IMPORTANT:
  We are NOT linking these to Food documents yet.
  This lets us safely test the recipe dataset first.
*/
function buildIngredients(
  quantities,
  parts
) {
  const ingredients = [];

  const maxLength = Math.max(
    quantities.length,
    parts.length
  );

  for (let i = 0; i < maxLength; i++) {
    const name =
      parts[i] !== undefined
        ? String(parts[i]).trim()
        : "";

    const quantity =
      quantities[i] !== undefined
        ? String(quantities[i]).trim()
        : "";

    if (!name) {
      continue;
    }

    ingredients.push({
      name,
      quantity
    });
  }

  return ingredients;
}

/*
  Read the CSV file.
*/
function readRecipes() {
  return new Promise((resolve, reject) => {
    let rowCount = 0;

    fs.createReadStream(CSV_FILE)
      .pipe(
        csv({
          mapHeaders: ({ header }) =>
            header.trim()
        })
      )
      .on("data", (row) => {
        if (recipes.length >= MAX_RECIPES) {
          return;
        }

        rowCount++;

        const quantities =
          parseCsvArray(
            row.RecipeIngredientQuantities
          );

        const parts =
          parseCsvArray(
            row.RecipeIngredientParts
          );

        const ingredients =
          buildIngredients(
            quantities,
            parts
          );

        /*
          Skip recipes that don't have
          basic required information.
        */
        if (
          !row.Name ||
          ingredients.length === 0
        ) {
          return;
        }

        const recipe = {
          name: String(row.Name).trim(),

          description:
            row.Description
              ? String(row.Description).trim()
              : "",

          ingredients,

          mealType:
            getMealType(
              row.RecipeCategory,
              row.Keywords
            ),

          instructions:
            parseInstructions(
              row.RecipeInstructions
            ),

          calories:
            parseNumber(row.Calories),

          protein:
            parseNumber(row.ProteinContent),

          carbs:
            parseNumber(
              row.CarbohydrateContent
            ),

          fat:
            parseNumber(row.FatContent),

          fiber:
            parseNumber(row.FiberContent),

          vitamins: [],

          isPublic: true,

          /*
            We keep the original dataset ID
            for reference.
          */
          externalRecipeId:
            String(row.RecipeId || ""),

          category:
            row.RecipeCategory
              ? String(
                  row.RecipeCategory
                ).trim()
              : "",

          image:
            extractImage(row.Images),

          prepTime:
            row.PrepTime || "",

          cookTime:
            row.CookTime || "",

          totalTime:
            row.TotalTime || "",

          servings:
            parseNumber(
              row.RecipeServings
            ) || 1,

          sugar:
            parseNumber(
              row.SugarContent
            ),

          sodium:
            parseNumber(
              row.SodiumContent
            ),

          cholesterol:
            parseNumber(
              row.CholesterolContent
            ),

          saturatedFat:
            parseNumber(
              row.SaturatedFatContent
            )
        };

        recipes.push(recipe);

        if (recipes.length % 100 === 0) {
          console.log(
            `Loaded ${recipes.length} recipes...`
          );
        }
      })
      .on("end", () => {
        console.log(
          `Finished reading CSV.`
        );

        console.log(
          `Recipes prepared: ${recipes.length}`
        );

        resolve();
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

/*
  Extract the first image URL from the
  Images field.

  Food.com sometimes stores multiple
  image URLs in a JSON-style array.
*/
function extractImage(value) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed[0] || null;
    }

    if (typeof parsed === "string") {
      return parsed;
    }
  } catch (error) {
    /*
      If it isn't valid JSON, try to
      extract a URL directly.
    */

    const match = String(value).match(
      /https?:\/\/[^\s"']+/i
    );

    if (match) {
      return match[0];
    }
  }

  return null;
}

/*
  Connect to MongoDB.
*/
async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is missing from .env"
    );
  }

  await mongoose.connect(
    process.env.MONGO_URI
  );

  console.log(
    "MongoDB Atlas connected successfully!"
  );
}

/*
  Import recipes.
*/
async function importRecipes() {
  try {
    console.log(
      "Starting NutriFlow recipe import..."
    );

    await connectDatabase();

    await readRecipes();

    if (recipes.length === 0) {
      console.log(
        "No recipes were found."
      );

      return;
    }

    /*
      Insert in batches instead of sending
      everything to MongoDB at once.
    */
    const BATCH_SIZE = 100;

    let inserted = 0;

    for (
      let i = 0;
      i < recipes.length;
      i += BATCH_SIZE
    ) {
      const batch = recipes.slice(
        i,
        i + BATCH_SIZE
      );

      try {
        const result =
          await Recipe.insertMany(
            batch,
            {
              ordered: false
            }
          );

        inserted += result.length;

        console.log(
          `Imported ${inserted}/${recipes.length}`
        );

      } catch (error) {
        console.error(
          "Batch import warning:",
          error.message
        );
      }
    }

    console.log(
      "================================"
    );

    console.log(
      "Recipe import completed!"
    );

    console.log(
      `Recipes attempted: ${recipes.length}`
    );

    console.log(
      `Recipes inserted: ${inserted}`
    );

    console.log(
      "================================"
    );

  } catch (error) {
    console.error(
      "Recipe import failed:"
    );

    console.error(
      error.message
    );

  } finally {
    await mongoose.connection.close();

    console.log(
      "MongoDB connection closed."
    );
  }
}

importRecipes();