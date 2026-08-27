# NutriFlow — Personalized Nutrition & Wellness Platform

## Overview

NutriFlow is a personalized nutrition and wellness platform built with **Node.js, Express, MongoDB, and Mongoose**.

The application helps users track their meals, nutrition, weight, hydration, lifestyle habits, goals, and recipes. It also provides personalized nutrition insights, ingredient-based recipe suggestions, nutrition calculations, and an explainable daily Balance Score.

---

# How to Run

## 1. Install Dependencies

```bash
npm install
```

## 2. Create Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
USDA_API_KEY=your_usda_api_key
```

**Important:** Never upload your `.env` file to GitHub. It contains private database credentials and API keys.

## 3. Seed the Food Database

```bash
node seed/foodSeed.js
```

## 4. Start the Development Server

```bash
npm run dev
```

The server runs on:

```text
http://localhost:5000
```

---

# Authentication & Authorization

NutriFlow uses **JWT-based authentication** and role-based authorization.

## Authentication — "Who are you?"

Users can register and log in using their credentials.

Passwords are securely hashed using **bcryptjs** and are never stored as plain text.

After a successful login, the server returns a JWT.

Protected requests must include:

```text
Authorization: Bearer <token>
```

## Authorization — "What are you allowed to do?"

NutriFlow supports two roles:

| Role | Access |
|---|---|
| `user` | Manage personal nutrition and wellness data |
| `admin` | User access plus food database administration |

Admin-only operations are protected using the `adminMiddleware`.

---

# Authentication Routes

Base path:

```text
/api/auth
```

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login and receive JWT |
| GET | `/me` | Protected | Get the currently authenticated user |

## Register

```http
POST /api/auth/register
```

Example request:

```json
{
  "firstName": "Jana",
  "lastName": "Salah",
  "email": "jana@example.com",
  "password": "your_password"
}
```

A successful registration returns the newly created user's basic information without exposing the password.

## Login

```http
POST /api/auth/login
```

Example request:

```json
{
  "email": "jana@example.com",
  "password": "your_password"
}
```

A successful login returns:

- JWT token
- User ID
- First name
- Last name
- Email

Invalid credentials return a generic authentication error.

---

# Main Features

- User registration and login
- JWT authentication
- Protected routes
- Role-based authorization
- Admin food management
- Secure password hashing
- Food database
- USDA FoodData Central integration
- Local food search
- Nutrition profile management
- Personalized nutrition calculations
- Meal tracking
- Daily nutrition summaries
- Goal management
- Weight tracking
- Progress tracking
- Recipe management
- Ingredient-based recipe suggestions
- Water tracking
- Lifestyle tracking
- Personalized nutrition insights
- Explainable Balance Score
- Input validation
- Rate limiting
- Security middleware
- Centralized error handling

---

# Project Structure

```text
NutriFlow project/
│
├── controllers/
│   ├── authController.js
│   ├── balanceController.js
│   ├── foodController.js
│   ├── goalController.js
│   ├── insightController.js
│   ├── lifestyleController.js
│   ├── mealController.js
│   ├── nutritionController.js
│   ├── profileController.js
│   ├── progressController.js
│   ├── recipeController.js
│   ├── recipeSuggestionController.js
│   └── waterController.js
│
├── middleware/
│   ├── adminMiddleware.js
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   ├── rateLimitMiddleware.js
│   └── validationMiddleware.js
│
├── models/
│   ├── Food.js
│   ├── Goal.js
│   ├── Lifestyle.js
│   ├── Meal.js
│   ├── NutritionProfile.js
│   ├── Recipe.js
│   ├── User.js
│   ├── Water.js
│   └── WeightEntry.js
│
├── routes/
│   ├── authRoutes.js
│   ├── balanceRoutes.js
│   ├── foodRoutes.js
│   ├── goalRoutes.js
│   ├── insightRoutes.js
│   ├── lifestyleRoutes.js
│   ├── mealRoutes.js
│   ├── nutritionRoutes.js
│   ├── profileRoutes.js
│   ├── progressRoutes.js
│   ├── recipeRoutes.js
│   ├── recipeSuggestionRoutes.js
│   └── waterRoutes.js
│
├── scripts/
│   └── makeAdmin.js
│
├── seed/
│   └── foodSeed.js
│
├── utils/
│   ├── nutritionCalculator.js
│   ├── nutritionHelper.js
│   └── passwordValidator.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

---

# API Endpoints

Base URL:

```text
http://localhost:5000/api
```

All protected endpoints require:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# Foods — `/api/foods`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get all foods |
| GET | `/search` | Protected | Search for foods |
| GET | `/:id` | Public | Get a food by ID |
| POST | `/` | Admin | Create a food |
| PUT | `/:id` | Admin | Update a food |
| DELETE | `/:id` | Admin | Delete a food |

## Food Database

Food records contain nutritional information including:

- Name
- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Vitamins

## Food Search

NutriFlow searches the local MongoDB food database first.

If no matching local food is found, NutriFlow can search **USDA FoodData Central**.

The application prioritizes standard/basic USDA food data and falls back to branded food data when necessary.

---

# Nutrition Profile — `/api/nutrition`

The nutrition profile stores information used to calculate personalized nutrition targets.

The profile includes:

- Age
- Gender
- Height
- Weight
- Activity level
- Nutrition goal

Supported goals:

```text
lose_weight
maintain_weight
gain_weight
```

Supported activity levels:

```text
sedentary
light
moderate
active
very_active
```

The calculated daily targets include:

- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Hydration

---

# Meals — `/api/meals`

NutriFlow allows users to track their daily meals.

Supported meal types:

```text
breakfast
lunch
dinner
snack
```

Meal information can include:

- Meal name
- Meal type
- Food
- Quantity
- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Vitamins
- Date

Users can manage their own meal records.

---

# Goals — `/api/goals`

Users can create and manage nutrition and weight goals.

Supported goal types:

```text
lose_weight
maintain_weight
gain_weight
```

Goal functionality includes:

- Creating goals
- Viewing goals
- Updating goals
- Managing the active goal

---

# Weight Tracking & Progress — `/api/progress`

NutriFlow stores users' weight history and uses it to calculate progress toward their active goal.

The progress system provides:

- Starting weight
- Current weight
- Target weight
- Weight change
- Progress percentage
- Weight history
- Nutrition consistency information

Example:

```text
Starting Weight → Current Weight → Target Weight
```

The progress percentage is limited between 0% and 100%.

---

# Recipes — `/api/recipes`

NutriFlow provides recipe management functionality.

Recipes can contain:

- Name
- Description
- Ingredients
- Meal type
- Instructions
- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Vitamins
- Public/private status

Users can manage their own recipes.

---

# Recipe Suggestions — `/api/recipes/suggestions`

## Ingredient-Based Recipe Matching

NutriFlow includes an ingredient-based recipe recommendation system.

The system compares the ingredients available to the user with the ingredients required by recipes.

Example:

```text
Available Ingredients:

✓ Chicken Breast
✓ Brown Rice

Recipe Ingredients:

✓ Chicken Breast
✓ Brown Rice
✗ Broccoli

Match: 2 / 3 = 67%
```

The recommendation system identifies:

- Matched ingredients
- Missing ingredients
- Matched ingredient count
- Total ingredient count
- Match percentage

Recipes can then be ranked according to how closely they match the user's available ingredients.

---

# Water Tracking — `/api/water`

NutriFlow allows users to track their daily water intake.

Features include:

- Add water entry
- View daily water total
- View water history
- Delete water entry

The system compares water consumption with the user's daily hydration target.

Example:

```text
Consumed: 500 ml
Target: 2000 ml
```

Daily water data can also be used by the Insights and Balance Score systems.

---

# Lifestyle Tracking — `/api/lifestyle`

Users can track lifestyle information that contributes to their overall wellness data.

Currently supported:

- Sleep hours
- Activity minutes

Features include:

- Add lifestyle entry
- Get lifestyle information
- Update lifestyle entry
- View lifestyle history
- Delete lifestyle entry

---

# Personalized Insights — `/api/insights`

NutriFlow generates personalized daily nutrition insights based on the user's tracked information.

The system can identify situations such as:

- Calories remaining
- Protein intake below target
- Fiber intake below target
- Very low water intake

Each insight contains:

- Type
- Severity level
- Message

Example:

```json
{
  "type": "protein",
  "level": "warning",
  "message": "Your protein intake is below your daily target."
}
```

Example insight types include:

```text
calories
protein
fiber
water
```

---

# Balance Score — `/api/balance`

NutriFlow provides an explainable daily **Balance Score from 0 to 100**.

The score evaluates several nutrition and hydration categories.

| Category | Maximum Points |
|---|---:|
| Calories | 25 |
| Protein | 20 |
| Carbohydrates | 15 |
| Fat | 15 |
| Fiber | 15 |
| Water | 10 |
| **Total** | **100** |

Example:

```text
Balance Score: 43 / 100

Calories      10 / 25
Protein       10 / 20
Carbohydrates  8 / 15
Fat            8 / 15
Fiber          5 / 15
Water          2 / 10
```

The API also returns the nutritional data and targets used to calculate the score.

Possible rating levels include:

```text
Needs Improvement
```

The detailed breakdown makes the score explainable rather than providing only one number.

---

# Nutrition Calculations

NutriFlow calculates personalized nutrition targets using information from the user's nutrition profile.

The system considers:

- Age
- Gender
- Height
- Weight
- Activity level
- Nutrition goal

The resulting targets include:

- Daily calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Water

These targets are then used by other parts of the application such as:

- Nutrition summaries
- Personalized insights
- Balance Score
- Progress tracking

---

# Recipe Matching System

The recipe suggestion system provides a practical way for users to find recipes based on ingredients they already have.

The system:

1. Receives available ingredients.
2. Compares them with recipe ingredients.
3. Identifies matching ingredients.
4. Identifies missing ingredients.
5. Calculates a match percentage.
6. Returns recipes according to their match.

Example:

```text
Available: 4 ingredients
Matched: 3 ingredients

Match Percentage = 75%
```

---

# Personalized Insights System

NutriFlow analyzes the user's daily nutrition and hydration data and generates useful feedback.

For example:

```text
You have 2372 calories remaining today.

Your protein intake is below your daily target.

Your fiber intake is below your daily target.

Very little water has been logged today.
```

Insights include a category and severity level so the frontend can display different types of feedback appropriately.

---

# Security

NutriFlow implements multiple security measures.

### Authentication

- JWT authentication
- Protected routes
- Token verification
- Token expiration

### Password Security

- bcrypt password hashing
- Passwords are never returned in API responses
- Password security validation

### Authorization

- User/admin roles
- Admin-only operations
- User ownership checks

### API Security

- Helmet security headers
- CORS configuration
- Rate limiting
- Request body size limit
- Input validation
- MongoDB ID validation
- Disabled `x-powered-by` header

---

# Validation

NutriFlow validates incoming request data before processing it.

Validation includes:

- Food names
- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Vitamins
- Nutrition profile information
- Meal information
- Meal types
- Quantities
- Dates
- MongoDB IDs
- Password requirements

Example validation response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "age",
      "message": "Age must be between 13 and 120"
    }
  ]
}
```

---

# Error Handling

NutriFlow uses centralized error handling for common errors.

Handled errors include:

- Mongoose validation errors
- Invalid MongoDB ObjectIds
- Duplicate database values
- Unexpected server errors

Common HTTP status codes include:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

Unknown API routes return:

```json
{
  "success": false,
  "message": "Route not found"
}
```

---

# External API

## USDA FoodData Central

NutriFlow integrates with **USDA FoodData Central** to retrieve nutritional information for foods that are not already available in the application's local database.

The food search process is:

```text
User searches for food
        ↓
Search NutriFlow MongoDB
        ↓
Food found?
   ↓ YES       ↓ NO
Return food   Search USDA
                  ↓
          Normalize nutrition data
                  ↓
              Return results
```

The application prioritizes standard/basic USDA food data before falling back to branded food data.

---

# Response Format

NutriFlow uses JSON responses with a `success` field to indicate whether a request was successful.

### Successful Response

Example:

```json
{
  "success": true,
  "message": "Water entry added successfully",
  "entry": {
    "user": "user_id",
    "amount": 500,
    "date": "2026-08-27T00:24:19.585Z"
  }
}
```

### Collection Response

Example:

```json
{
  "success": true,
  "count": 1,
  "entries": []
}
```

### Error Response

Example:

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

# Testing with Postman

The NutriFlow backend has been tested using **Postman**.

Tested functionality includes:

- User registration
- User login
- JWT authentication
- Protected routes
- Admin authorization
- Food retrieval
- Food search
- Food creation
- Food update
- Food deletion
- Nutrition profile
- Meal tracking
- Goal management
- Weight tracking
- Progress calculation
- Recipe management
- Recipe suggestions
- Water tracking
- Water deletion
- Lifestyle tracking
- Lifestyle update
- Lifestyle deletion
- Personalized insights
- Balance Score

Example successful API operations include:

```text
Water entry added successfully
Water entry deleted successfully
Lifestyle entry added successfully
Lifestyle entry updated successfully
Lifestyle entry deleted successfully
```

---

# Development

Start the development server with:

```bash
npm run dev
```

The server connects to MongoDB Atlas before starting.

Expected output:

```text
MongoDB Atlas connected successfully!
NutriFlow server is running on port 5000
```

---

# Environment Variables

NutriFlow requires the following environment variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
USDA_API_KEY=your_usda_api_key
```

Never commit the `.env` file to GitHub.

---

# Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **JWT**
- **bcryptjs**
- **express-validator**
- **Helmet**
- **CORS**
- **Express Rate Limit**
- **USDA FoodData Central API**
- **Postman**
- **Git & GitHub**

---

# Future Enhancements

The current backend provides the core NutriFlow functionality.

Possible future enhancements include:

- Profile image upload
- Recipe image upload
- React frontend
- Interactive nutrition dashboard
- Nutrition charts
- Weight progress visualization
- Hydration visualization
- Responsive user interface
- Frontend API integration
- Deployment to a production environment
