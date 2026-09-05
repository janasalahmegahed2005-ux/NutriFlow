NutriFlow — Personalized Nutrition & Wellness Platform (MEAN)

NutriFlow is a personalized nutrition and wellness web application designed to help users understand their nutrition, track daily meals and hydration, manage goals, monitor weight progress, discover recipes, and receive personalized wellness feedback.

The project uses a separate Angular frontend and a Node.js/Express backend. The frontend communicates with the backend over HTTP and never connects directly to MongoDB.

Part

Folder

Built with

Backend REST API

Repository root

Node.js, Express, MongoDB, Mongoose

Frontend

frontend/

Angular 22, TypeScript, HTML, CSS

Frontend URL: http://localhost:4200/
Backend URL: http://localhost:5000/
API Base URL: http://localhost:5000/api

How to Run

NutriFlow requires both the backend and frontend to be running during development.

The backend

The backend files are located in the repository root.

1. Install dependencies

npm install

2. Create the environment file

Create a .env file in the repository root.

Use placeholders for your own private values:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
USDA_API_KEY=your_usda_api_key

Never commit .env or real credentials to GitHub.

3. Start the backend

For development with Nodemon:

npm run dev

For a normal Node.js start:

npm start

The API runs on:

http://localhost:5000

The root test endpoint is:

GET http://localhost:5000/

and returns:

{
  "message": "Welcome to NutriFlow API 🥗"
}

The frontend

Open a second terminal:

cd frontend

Install the Angular dependencies:

npm install

Start the Angular development server:

npm start

Then open:

http://localhost:4200/

The frontend uses Angular's development server and communicates with the backend at http://localhost:5000.

Authentication & Authorization

NutriFlow uses JWT-based authentication.

Authentication — "Who are you?"

Users can:

Register

Log in

Retrieve the currently authenticated user

Log out

Passwords are hashed using bcryptjs before being stored.

After authentication, protected API requests use:

Authorization: Bearer <JWT_TOKEN>

The frontend stores authentication information using:

nutriflow_token
nutriflow_user

The currently verified authentication implementation uses a 1-hour JWT lifetime.

Passwords are never returned in successful user responses.

Authorization — "What are you allowed to do?"

NutriFlow supports two roles:

Role

Access

user

Manage personal nutrition and wellness data

admin

User access plus food database administration

Personal resources use ownership checks, while food creation, updating, and deletion are restricted to administrators.

Authentication Routes

Base path:

/api/auth

Method

Endpoint

Access

Description

POST

/register

Public

Register a new user

POST

/login

Public

Login and receive authentication data

GET

/me

Protected

Get the current authenticated user

Example login:

POST /api/auth/login
Content-Type: application/json

{
  "email": "your_email@example.com",
  "password": "your_password"
}

Main Features

NutriFlow brings nutrition and wellness information into one application.

User registration and login

JWT authentication

Role-based authorization

Nutrition profile management

Personalized calorie and macronutrient targets

Food database

Local food search

USDA FoodData Central integration

Food Diary

Daily nutrition summaries

Nutrition Lookup

Recipe discovery

Ingredient-based recipe suggestions

Recipe management

Water tracking

Lifestyle tracking

Goals

Weight and progress tracking

Personalized nutrition insights

Daily Balance Score

Profile image support

Input validation

Rate limiting

Helmet security headers

Centralized error handling

Application Architecture

                         NUTRIFLOW

                            User
                             |
                             v
                    Angular Frontend
                    localhost:4200
                             |
                         HTTP / REST
                             |
                             v
                   Node.js / Express
                    Backend API
                    localhost:5000
                             |
              +--------------+--------------+
              |                             |
              v                             v
        MongoDB Atlas                  External APIs
                                      USDA / Recipe API

The frontend is responsible for the user interface, navigation, forms, API requests, and displaying results.

The backend is responsible for authentication, authorization, validation, business logic, database operations, nutrition calculations, and external service integrations.

Food Database & Nutrition Lookup

Food API

Base path:

/api/foods

Method

Endpoint

Access

Description

GET

/api/foods

Public

Get foods

GET

/api/foods/search

Protected

Search for food

GET

/api/foods/:id

Public

Get a food by ID

POST

/api/foods

Admin

Create a food

PUT

/api/foods/:id

Admin

Update a food

DELETE

/api/foods/:id

Admin

Delete a food

Food records contain:

Name

Calories

Protein

Carbohydrates

Fat

Fiber

Vitamins

Food Search

NutriFlow can use both local food data and USDA FoodData Central.

The search endpoint validates queries between 2 and 100 characters.

Example:

GET /api/foods/search?query=rice

USDA nutrition results are normalized before being returned to the frontend.

Nutrition Lookup

Nutrition Lookup is an informational feature.

The user can:

Search for a food

View matching results

Select a food

View calories and macronutrients

Change the serving size

See recalculated nutrition values

The frontend calculates serving values from the per-100g nutrition information:

Displayed Nutrition =
Nutrition per 100g × Serving Size / 100

Nutrition Lookup does not automatically add the selected food to the Food Diary.

Food Diary

Base API:

/api/meals

Method

Endpoint

Access

Description

POST

/api/meals

Protected

Add a meal

GET

/api/meals

Protected

Get meals

GET

/api/meals/:id

Protected

Get one meal

PUT

/api/meals/:id

Protected

Update a meal

DELETE

/api/meals/:id

Protected

Delete a meal

Supported meal types:

breakfast
lunch
dinner
snack

The Food Diary allows users to:

Select a meal type

Search for foods

Select a food

Enter a quantity

Preview nutrition

Add meals

Select a date

Refresh the diary

Delete meals

Nutrition for a quantity is calculated using the food's per-100g values.

Nutrition =
Nutrition per 100g × Quantity / 100

Daily Nutrition Summary

Endpoint:

GET /api/nutrition/summary

The summary can provide:

Daily calorie target

Calories consumed

Calories remaining

Protein target and intake

Carbohydrate target and intake

Fat target and intake

Fiber target and intake

Number of meals

Remaining nutrition values are clamped at zero.

Nutrition Profile & Personalized Targets

Base API:

/api/profile

Method

Endpoint

Access

Description

POST

/api/profile

Protected

Create nutrition profile

GET

/api/profile

Protected

Get nutrition profile

PUT

/api/profile

Protected

Update nutrition profile

DELETE

/api/profile

Protected

Delete nutrition profile

The nutrition profile includes:

Age

Gender

Height

Weight

Activity level

Nutrition goal

Supported goals:

lose_weight
maintain_weight
gain_weight

Supported activity levels:

sedentary
light
moderate
active
very_active

Personalized targets include:

Calories

Protein

Carbohydrates

Fat

Fiber

Hydration

The backend uses the profile information for nutrition target calculations.

Goals

Base API:

/api/goals

Method

Endpoint

Access

Description

POST

/api/goals

Protected

Create a goal

GET

/api/goals

Protected

Get active goal

GET

/api/goals/history

Protected

Get goal history

PUT

/api/goals

Protected

Update active goal

DELETE

/api/goals

Protected

Deactivate active goal

NutriFlow prevents multiple simultaneous active goals.

Goal information includes:

Goal type

Target weight

Daily calories

Protein target

Carbohydrate target

Fat target

Active status

Weight Tracking & Progress

Base API:

/api/progress

Method

Endpoint

Access

Description

POST

/api/progress/weight

Protected

Add weight entry

GET

/api/progress/weight

Protected

Get weight history

GET

/api/progress

Protected

Get complete progress

DELETE

/api/progress/weight/:id

Protected

Delete weight entry

The progress system uses:

Starting Weight → Current Weight → Target Weight

It can provide:

Starting weight

Current weight

Target weight

Weight change

Progress percentage

Weight history

Progress percentages are constrained to sensible 0–100% bounds.

Water Tracking

Base API:

/api/water

Method

Endpoint

Access

Description

GET

/api/water/today

Protected

Get today's water

GET

/api/water

Protected

Get water history

POST

/api/water

Protected

Add water

DELETE

/api/water/:id

Protected

Delete water entry

Water tracking allows users to:

Add water

View today's total

View water history

Delete entries

Compare intake with hydration targets

Water data is also used by the Balance Score system.

Lifestyle Tracking

Base API:

/api/lifestyle

Method

Endpoint

Access

Description

GET

/api/lifestyle/today

Protected

Get today's lifestyle data

GET

/api/lifestyle

Protected

Get lifestyle history

POST

/api/lifestyle

Protected

Add/update lifestyle data

DELETE

/api/lifestyle/:id

Protected

Delete lifestyle entry

Lifestyle tracking can include information such as:

Sleep hours

Activity minutes

Recipes

Base API:

/api/recipes

Method

Endpoint

Access

Description

GET

/api/recipes/search

Public

Search public recipes

GET

/api/recipes

Public

Get public recipes

GET

/api/recipes/:id

Public

Get one recipe

POST

/api/recipes

Protected

Create a recipe

PUT

/api/recipes/:id

Protected + Owner

Update a recipe

DELETE

/api/recipes/:id

Protected + Owner

Delete a recipe

Recipe information can include:

Name

Description

Ingredients

Meal type

Instructions

Calories

Protein

Carbohydrates

Fat

Fiber

Vitamins

Creator

Public/private status

Recipe ingredients can reference Food records and include quantities.

Recipe Suggestions — "What Can I Make?"

Endpoint:

POST /api/recipes/suggestions

The recipe suggestion feature is designed around available ingredients.

Example:

Available Ingredients
✓ Chicken Breast
✓ Brown Rice
✓ Tomato

The frontend sends the available ingredients to the backend.

The backend can then:

Receive available ingredients

Compare them with recipe ingredients

Identify matching ingredients

Identify missing ingredients

Calculate a match percentage

Return suitable recipes

Example:

Recipe Ingredients
✓ Chicken Breast
✓ Brown Rice
✗ Broccoli

Match: 2 / 3 = 67%

The external recipe integration is kept on the backend through:

services/recipeApiService.js

This keeps external API credentials out of the Angular application.

Note: The exact external recipe provider is intentionally not hard-coded in this README because the current active provider was not verified from the available project source.

Personalized Insights

Endpoint:

GET /api/insights

Personalized Insights provides nutrition and wellness feedback based on the user's tracked information.

Examples include:

Calories remaining

Protein intake below target

Fiber intake below target

Very low water intake

Insights can contain:

Type
Severity
Message

This allows the frontend to present different types of feedback depending on the insight severity.

Daily Balance Score

Endpoint:

GET /api/balance

NutriFlow provides an explainable daily Balance Score from 0 to 100.

Category

Maximum Points

Calories

25

Protein

20

Carbohydrates

15

Fat

15

Fiber

15

Water

10

Total

100

Rating thresholds:

Score

Rating

90+

Excellent

75–89

Good

60–74

Fair

Below 60

Needs Improvement

The current backend Balance Score implementation uses a hydration target of 2000 mL.

The detailed breakdown makes the score explainable instead of displaying only one number.

Frontend Routes

The currently verified Angular routes are:

Route

Page

/login

Login

/register

Register

/dashboard

Dashboard

/food-diary

Food Diary

/recipes

Recipes

/nutrition-lookup

Nutrition Lookup

The default route:

/

redirects to:

/dashboard

Unknown routes also redirect to:

/dashboard

The application uses Angular standalone components and Angular Router.

Frontend Authentication

The Angular frontend uses AuthService to manage authentication state.

The service stores:

nutriflow_token
nutriflow_user

in browser localStorage.

Protected API requests use:

Authorization: Bearer <JWT_TOKEN>

The frontend does not connect directly to MongoDB.

Project Structure

The current architecture follows a root-level Node.js backend with a separate Angular frontend:

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
├── services/
│   └── recipeApiService.js
│
├── utils/
│   ├── nutritionCalculator.js
│   ├── nutritionHelper.js
│   └── passwordValidator.js
│
├── uploads/
│   ├── default-user.png
│   └── users/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── server.js

Backend Technology Stack

Node.js

Express 5

MongoDB Atlas

Mongoose

JavaScript / CommonJS

bcryptjs

jsonwebtoken

Multer

Helmet

CORS

express-rate-limit

express-validator

dotenv

csv-parser

Nodemon

Frontend Technology Stack

Angular 22.1.x

TypeScript 6

HTML

CSS

Angular Router

Angular HttpClient

Angular Forms

RxJS

Standalone Components

Vitest

JSDOM

Prettier

Backend Security

NutriFlow includes several security measures:

JWT authentication

Protected endpoints verify the user's JWT.

Password hashing

Passwords are hashed using bcryptjs.

Role-based access

Administrative food operations require the admin role.

Validation

Incoming data is validated through the application's validation middleware.

Rate limiting

Rate limiting is configured for API protection, including authentication and food-search operations.

Security headers

The backend uses Helmet.

CORS

Development CORS is configured for:

http://localhost:4200

Reduced server fingerprinting

Express's x-powered-by header is disabled.

Request size limit

JSON request bodies are limited to 10 KB.

Environment secrets

Private credentials and API keys belong in .env and must never be committed to GitHub.

Development Workflow

Typical development setup:

Terminal 1
    |
    v
Node.js / Express
http://localhost:5000
    |
    v
MongoDB Atlas


Terminal 2
    |
    v
Angular
http://localhost:4200
    |
    v
HTTP requests
    |
    v
Node.js / Express

Both applications should be running when using features that depend on backend data.

API Endpoint Summary

Module

Base Endpoint

Authentication

/api/auth

Foods

/api/foods

Meals

/api/meals

Nutrition Profile

/api/profile

Nutrition Summary

/api/nutrition

Goals

/api/goals

Progress

/api/progress

Recipes

/api/recipes

Recipe Suggestions

/api/recipes/suggestions

Water

/api/water

Lifestyle

/api/lifestyle

Insights

/api/insights

Balance Score

/api/balance

All protected endpoints require:

Authorization: Bearer <JWT_TOKEN>

Example Data Flow — Adding a Meal

1. User selects a food
        |
        v
2. User enters quantity
        |
        v
3. Angular prepares the meal request
        |
        v
4. JWT is sent with the request
        |
        v
5. Express receives the request
        |
        v
6. Backend validates the user and meal data
        |
        v
7. Nutrition values are calculated
        |
        v
8. Meal is stored in MongoDB
        |
        v
9. JSON response is returned
        |
        v
10. Angular updates the Food Diary

Example Data Flow — Nutrition Lookup

User searches for food
        |
        v
Angular
        |
        v
GET /api/foods/search
        |
        v
NutriFlow Backend
        |
        +------> Local MongoDB food data
        |
        +------> USDA FoodData Central
        |
        v
Normalized nutrition result
        |
        v
Angular Nutrition Lookup
        |
        v
User changes serving size
        |
        v
Displayed nutrition is recalculated

Nutrition Lookup remains informational and does not create a meal entry.

Design

NutriFlow follows a friendly wellness-focused visual direction.

The established interface uses:

Warm cream/off-white backgrounds

Natural green and sage accents

Soft pink/dusty rose accents

Light blue accents

Peach accents

Rounded cards and controls

Clean modern typography

Friendly, approachable UI

Responsive layouts

Clear nutrition and wellness visual hierarchy

The existing visual design is intended to remain cohesive across the application.

Development Notes

The project is actively developed as a full-stack Angular + Node.js application.

The backend and frontend are intentionally separated:

Frontend
Angular
   |
   | REST / JSON
   v
Backend
Express
   |
   +---- MongoDB Atlas
   |
   +---- External services

The frontend never connects directly to MongoDB, and external service credentials remain on the backend.

Security Notes

Do not commit:

.env

Do not place:

MongoDB credentials

JWT secrets

USDA API keys

Other private credentials

inside frontend source code or GitHub.

If a secret is accidentally exposed, rotate it immediately and replace it with a new secret stored in .env.

Testing & Verification

Backend API functionality has been tested during development using tools such as Postman.

Frontend development can be tested with:

cd frontend
npm test

A production build can be generated with:

cd frontend
npm run build

Backend development can be run with:

npm run dev

Current Project Status

Implemented areas include:

Authentication and JWT

User authorization

Food database and food search

USDA nutrition integration

Nutrition profile and calculations

Food Diary

Nutrition summaries

Goals

Weight and progress tracking

Water tracking

Balance Score

Recipes

Recipe suggestion architecture

Lifestyle tracking architecture

Personalized insights architecture

Angular Dashboard

Authentication pages

Food Diary interface

Nutrition Lookup

Recipe Finder

Shared sidebar

Some frontend areas and integrations may require additional live verification before being considered fully complete, particularly the current external recipe provider, AI Food Scanner, Meal Planner, and the final integration of every sidebar item with a registered Angular route.

License

This project is currently distributed as an academic/development project. No separate open-source license has been specified.
