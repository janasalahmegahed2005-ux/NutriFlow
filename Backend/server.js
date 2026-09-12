const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();

const foodRoutes = require("./routes/foodRoutes");
const authRoutes = require("./routes/authRoutes");
const mealRoutes = require("./routes/mealRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const profileRoutes = require("./routes/profileRoutes");
const nutritionRoutes = require("./routes/nutritionRoutes");
const goalRoutes = require("./routes/goalRoutes");
const progressRoutes = require("./routes/progressRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const recipeSuggestionRoutes = require("./routes/recipeSuggestionRoutes");
const waterRoutes = require("./routes/waterRoutes");
const lifestyleRoutes = require("./routes/lifestyleRoutes");
const insightRoutes = require("./routes/insightRoutes");
const balanceRoutes = require("./routes/balanceRoutes");
const aiScannerRoutes = require("./routes/aiScannerRoutes");


const errorHandler = require("./middleware/errorMiddleware");

const app = express();

app.use("/uploads", express.static("uploads"));


// ==========================================
// SECURITY
// ==========================================

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.disable("x-powered-by");

// ==========================================
// BODY PARSING
// ==========================================

// Parse JSON request bodies
app.use(express.json({ limit: "10kb" }));


// ==========================================
// API ROUTES
// ==========================================


app.use("/api/foods", foodRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/profile", (req, res, next) => {
  console.log("🔥 PROFILE ROUTE HIT:", req.method, req.originalUrl);
  next();
}, profileRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/recipes/suggestions", recipeSuggestionRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/lifestyle", lifestyleRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/ai-scanner", aiScannerRoutes);



// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to NutriFlow API 🥗",
  });
});


// ==========================================
// HANDLE UNKNOWN ROUTES
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


// ==========================================
// CENTRALIZED ERROR HANDLER
// ==========================================

app.use(errorHandler);


// ==========================================
// CONNECT TO MONGODB
// ==========================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected successfully!");

    app.listen(5000, () => {
      console.log("NutriFlow server is running on port 5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });