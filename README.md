# NutriFlow — Personalized Nutrition & Wellness Platform

NutriFlow is a full-stack nutrition and wellness platform designed to help users track their meals, monitor nutrition, manage personal goals, discover recipes, and maintain healthier daily habits.

The project uses an Angular frontend, Node.js/Express backend, and MongoDB database.

---

## 🌱 Project Overview

NutriFlow provides users with a personalized platform for managing their nutrition and wellness journey.

The application allows users to:

- Create and manage an account
- Build a personalized nutrition profile
- Calculate daily calorie and macronutrient needs
- Search for foods and view nutritional information
- Track meals and daily food intake
- Monitor calories, protein, carbohydrates, fat, and fiber
- Discover recipes based on available ingredients
- Create and manage recipes
- Track water intake
- Set nutrition and fitness goals
- Track weight and progress
- View nutrition insights
- Monitor overall nutrition balance
- Manage their profile and application settings

---

# 🏗️ System Architecture

NutriFlow follows a full-stack client-server architecture:

```text
┌───────────────────────────────┐
│        Angular Frontend       │
│          Port 4200            │
└───────────────┬───────────────┘
                │
                │ HTTP / REST API
                ▼
┌───────────────────────────────┐
│      Node.js + Express        │
│          Port 5000             │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       MongoDB / Mongoose      │
└───────────────────────────────┘

External Services:
- USDA FoodData Central
- External Recipe API
