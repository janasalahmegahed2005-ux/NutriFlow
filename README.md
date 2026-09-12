NutriFlow — Personalized Nutrition & Wellness Platform

NutriFlow is a full-stack personalized nutrition and wellness platform designed to help users understand their nutrition, track meals and hydration, manage health-related goals, discover recipes, monitor progress, and receive personalized feedback.

The project is divided into two applications:

Part

Folder

Built with

Backend REST API

Backend/

Node.js, Express.js, MongoDB, Mongoose

Frontend

frontend/

Angular 22, TypeScript, HTML, CSS

The Angular frontend communicates with the backend through REST APIs. The frontend does not connect directly to MongoDB.

Table of Contents

Overview

Main Features

Technology Stack

Application Architecture

How to Run

Project Structure

Authentication & Authorization

User Profile & Personalization

Dashboard

Food Diary

Nutrition Lookup

AI Food Scanner

Recipes

Recipe Finder & Ingredient Matching

Meal Planner

Water Tracking

Goals & Weight Progress

Personalized Insights

Daily Balance Score

Nutrition Calculations

API Endpoints

Data Flow Examples

Security

Validation & Error Handling

External APIs

Testing with Postman

Environment Variables

Frontend Development

Git & GitHub

Future Enhancements

Overview

NutriFlow brings several nutrition and wellness activities into one platform.

The application allows a user to:

Create an account and log in securely

Build a personalized nutrition profile

Receive daily calorie and macronutrient targets

Track meals and food quantities

Search for nutritional information

Use the AI Food Scanner area for food recognition

Discover and manage recipes

Find recipes based on ingredients they already have

Plan meals

Track daily water intake

Set nutrition and weight goals

Record weight history and monitor progress

Track lifestyle information such as sleep and activity

Receive personalized nutrition insights

View an explainable Daily Balance Score

Manage profile and account settings

The backend provides the application's authentication, authorization, database operations, nutrition calculations, food and meal logic, recipe integrations, wellness calculations, and API layer.

Main Features

Authentication

User registration

User login

JWT authentication

Protected routes

Logout

Password hashing with bcryptjs

Token-based authorization

Personalized Nutrition

Nutrition profile

Daily calorie target

Protein target

Carbohydrate target

Fat target

Fiber target

Hydration target

Goal-based personalization

Food & Meals

Food database

Food search

USDA nutrition lookup

Food Diary

Breakfast, lunch, dinner, and snack tracking

Quantity-based nutrition calculation

Daily nutrition summaries

Wellness

Water tracking

Lifestyle tracking

Weight tracking

Goal management

Progress monitoring

Personalized insights

Daily Balance Score

Recipes

Recipe discovery

Recipe details

Recipe management

Ingredient-based recipe suggestions

Matched and missing ingredient detection

Recipe match percentage

External recipe API integration

Security

JWT verification

Password hashing

Authorization checks

Input validation

Rate limiting

Helmet security headers

CORS configuration

MongoDB ID validation

Centralized error handling

Technology Stack

Frontend

Angular 22.1.6

TypeScript

HTML

CSS

Angular Router

Angular HttpClient

Standalone Angular Components

SweetAlert2

REST API communication

Backend

Node.js

Express.js

MongoDB Atlas

Mongoose

JWT

bcryptjs

express-validator

Helmet

CORS

Express Rate Limit

Multer

Nodemon

External Services

USDA FoodData Central

External Recipe API

Development & Testing

Postman

Git

GitHub

VS Code

Application Architecture

NutriFlow follows a separated frontend/backend architecture.

                         NUTRIFLOW
                             |
              +--------------+--------------+
              |                             |
              v                             v
      Angular Frontend                 Express Backend
        localhost:4200                 localhost:5000
              |                             |
              |       REST / HTTP           |
              +---------------------------->|
                                            |
                              +-------------+-------------+
                              |                           |
                              v                           v
                        MongoDB Atlas              External APIs
                                                      |
                                             +--------+--------+
                                             |                 |
                                             v                 v
                                          USDA API        Recipe API

Frontend responsibilities

User Interface
      |
      v
Angular Components
      |
      v
Forms & User Interaction
      |
      v
Angular Services / HttpClient
      |
      v
REST API Requests
      |
      v
Display Backend Responses

Backend responsibilities

REST API Routes
      |
      v
Middleware
      |
      v
Controllers
      |
      v
Validation & Business Logic
      |
      +-------------------+
      |                   |
      v                   v
   MongoDB          External APIs

The frontend is responsible for presentation and interaction, while the backend handles application logic, database access, authentication, calculations, and secret-dependent integrations.

How to Run

NutriFlow requires both the backend and frontend to be running during development.

1. Backend

Open a terminal in the project root:

cd Backend

Install backend dependencies:

npm install

Create the .env file as described in Environment Variables.

Start the development server:

npm run dev

The backend runs on:

http://localhost:5000

Expected output:

MongoDB Atlas connected successfully!
NutriFlow server is running on port 5000

2. Frontend

Open a second terminal:

cd frontend

Install frontend dependencies:

npm install

Start Angular:

ng serve

Open:

http://localhost:4200

Quick Start

Terminal 1

cd Backend
npm install
npm run dev

Terminal 2

cd frontend
npm install
ng serve

Then open:

http://localhost:4200

Project Structure

The current project is organized into separate backend and frontend applications.

NutriFlow project/
│
├── Backend/
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── balanceController.js
│   │   ├── foodController.js
│   │   ├── goalController.js
│   │   ├── insightController.js
│   │   ├── lifestyleController.js
│   │   ├── mealController.js
│   │   ├── nutritionController.js
│   │   ├── profileController.js
│   │   ├── progressController.js
│   │   ├── recipeController.js
│   │   ├── recipeSuggestionController.js
│   │   └── waterController.js
│   │
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   └── validationMiddleware.js
│   │
│   ├── models/
│   │   ├── Food.js
│   │   ├── Goal.js
│   │   ├── Lifestyle.js
│   │   ├── Meal.js
│   │   ├── NutritionProfile.js
│   │   ├── Recipe.js
│   │   ├── User.js
│   │   ├── Water.js
│   │   └── WeightEntry.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── balanceRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── goalRoutes.js
│   │   ├── insightRoutes.js
│   │   ├── lifestyleRoutes.js
│   │   ├── mealRoutes.js
│   │   ├── nutritionRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── recipeRoutes.js
│   │   ├── recipeSuggestionRoutes.js
│   │   └── waterRoutes.js
│   │
│   ├── scripts/
│   │   └── makeAdmin.js
│   │
│   ├── seed/
│   │   └── foodSeed.js
│   │
│   ├── services/
│   │   └── recipeApiService.js
│   │
│   ├── utils/
│   │   ├── nutritionCalculator.js
│   │   ├── nutritionHelper.js
│   │   └── passwordValidator.js
│   │
│   ├── uploads/
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── features/
│   │       ├── shared/
│   │       └── services/
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── angular.json
│
├── .gitignore
└── README.md

The Backend/ directory contains all server-side code. The frontend/ directory contains the Angular application.

Authentication & Authorization

NutriFlow uses JWT-based authentication.

Authentication answers:

Who are you?

Authorization answers:

What are you allowed to do?

User Authentication Flow

User
 |
 | Register / Login
 v
Angular Frontend
 |
 | POST request
 v
Express Backend
 |
 | Validate credentials
 v
MongoDB
 |
 | User verified
 v
JWT generated
 |
 v
Angular stores authentication state
 |
 v
Protected NutriFlow pages

JWT

Protected requests include:

Authorization: Bearer <JWT_TOKEN>

The frontend uses:

nutriflow_token
nutriflow_user

as its local storage keys for authentication state.

The actual JWT must never be committed to GitHub.

Roles

NutriFlow supports:

Role

Access

user

Manage personal nutrition and wellness data

admin

User access plus administrative food/database operations

Administrative operations are protected by authorization middleware.

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

Login and receive JWT

GET

/me

Protected

Get the authenticated user

Example — Login

POST /api/auth/login

Request:

{
  "email": "user@example.com",
  "password": "your_password"
}

A successful login returns authentication information including a JWT and user information.

Invalid credentials return a generic authentication error rather than revealing which account information exists.

User Profile & Personalization

NutriFlow provides a dedicated profile and settings experience.

Users can manage account information such as:

First name

Last name

Username

Email

Profile image

Password

The nutrition profile is used to personalize the user's nutrition targets.

The profile contains:

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

Dashboard

The Dashboard is the main overview page of NutriFlow.

It brings together information from several parts of the application.

                         Dashboard
                             |
       +----------+----------+----------+----------+
       |          |          |          |          |
       v          v          v          v          v
   Nutrition    Meals      Water      Goals    Progress
       |          |          |          |          |
       +----------+----------+----------+----------+
                             |
                 +-----------+-----------+
                 |                       |
                 v                       v
             Insights              Balance Score

The dashboard can display:

Daily calorie target

Calories consumed

Calories remaining

Protein intake

Carbohydrate intake

Fat intake

Fiber intake

Water intake

Goal progress

Weight progress

Personalized insights

Daily Balance Score

Food Diary

The Food Diary allows users to record the food they consume.

Supported meal types:

Breakfast
Lunch
Dinner
Snack

A meal can contain:

Meal name

Meal type

Food

Quantity

Calories

Protein

Carbohydrates

Fat

Fiber

Vitamins

Date

Quantity-Based Nutrition

For foods whose nutrition values are stored per 100 grams:

Actual Nutrition
=
Nutrition per 100g × Quantity / 100

For example:

Food nutrition: 200 kcal / 100g
Quantity:       150g

Actual calories:
200 × 150 / 100
= 300 kcal

This allows the Food Diary to represent the user's actual intake rather than only a standard serving.

Nutrition Lookup

Nutrition Lookup is an informational food-search feature.

It allows the user to:

Search for a food

View matching foods

Select a food

View nutrition information

Change the serving quantity

See recalculated nutrition values

Nutrition information can include:

Calories

Protein

Carbohydrates

Fat

Fiber

Important Behavior

Nutrition Lookup does not automatically create a Food Diary entry.

Nutrition Lookup
       |
       v
Search Food
       |
       v
View Nutrition
       |
       v
Change Quantity
       |
       v
Recalculate Displayed Values

The Food Diary is a separate action:

Food Diary
    |
    v
Record Food Consumption

Food Search Flow

User searches for food
        |
        v
Angular Frontend
        |
        v
NutriFlow Backend
        |
        v
Search local MongoDB
        |
        +---- Food found ----> Return local result
        |
        +---- Not found -----> Search USDA
                                  |
                                  v
                           Normalize results
                                  |
                                  v
                              Return data

Example:

GET /api/foods/search?query=rice

The frontend does not connect directly to MongoDB.

AI Food Scanner

NutriFlow includes an AI Food Scanner area for food recognition.

The feature is designed to help users identify food from an image and connect the result with the application's nutrition functionality.

The frontend is responsible for:

Selecting an image

Displaying the selected image

Sending the required request

Displaying the returned result

The backend or configured AI integration is responsible for the recognition process.

The scanner can be extended in the future with more advanced food recognition and automatic nutrition extraction.

Recipes

NutriFlow provides recipe discovery and recipe management functionality.

Recipe information can include:

Recipe name

Description

Image

Ingredients

Instructions

Meal type/category

Nutrition information

Recipe source

The frontend communicates with the NutriFlow backend rather than directly exposing external API credentials.

The backend can combine recipes stored in MongoDB with recipes retrieved from an external recipe service.

Recipe Finder & Ingredient Matching

NutriFlow includes an ingredient-based Recipe Finder.

The user can enter ingredients they currently have.

Example:

Chicken
Rice
Tomato

The frontend sends the ingredients to the backend.

The backend searches available recipe sources and returns suitable recipes.

Recipe Matching

The recommendation system compares available ingredients with recipe ingredients.

Example:

Available Ingredients
---------------------
✓ Chicken Breast
✓ Brown Rice

Recipe Ingredients
------------------
✓ Chicken Breast
✓ Brown Rice
✗ Broccoli

The match is:

2 / 3 = 67%

The system can return:

Matched ingredients

Missing ingredients

Matched ingredient count

Total ingredient count

Match percentage

Recipe details

Matching Flow

Available Ingredients
        |
        v
Backend Recipe Endpoint
        |
        v
Search Recipe Sources
        |
        v
Compare Ingredients
        |
        +---- Matched Ingredients
        |
        +---- Missing Ingredients
        |
        v
Calculate Match Percentage
        |
        v
Rank Recipes
        |
        v
Angular Recipe Cards

Meal Planner

The Meal Planner provides an interface for organizing meals around the user's nutrition goals.

Planning information can include:

Date

Meal type

Selected food

Selected recipe

Quantity

Nutrition values

The Meal Planner can work together with:

Food Diary

Recipes

Nutrition calculations

Personalized targets

Water Tracking

NutriFlow allows users to track daily hydration.

Features include:

Add water entry

View daily water total

View water history

Delete water entry

Compare consumption with the daily hydration target

Example:

Daily Target: 2000 ml
Consumed:      500 ml
Remaining:    1500 ml

Water information can also contribute to:

Personalized Insights

Daily Balance Score

Dashboard summaries

Goals & Weight Progress

NutriFlow allows users to manage nutrition and weight goals.

Supported goals:

lose_weight
maintain_weight
gain_weight

Goal information can include:

Current goal

Starting weight

Target weight

Current weight

Progress

Goal status

Weight Tracking

NutriFlow stores weight history.

Starting Weight
       |
       v
Current Weight
       |
       v
Target Weight

Progress information can include:

Starting weight

Current weight

Target weight

Weight change

Progress percentage

Weight history

The progress percentage is calculated from the user's stored progress toward the selected target.

Personalized Insights

NutriFlow generates personalized nutrition and wellness feedback based on tracked data.

The system can identify situations such as:

Calories remaining

Protein intake below target

Fiber intake below target

Very low water intake

An insight can contain:

{
  "type": "protein",
  "level": "warning",
  "message": "Your protein intake is below your daily target."
}

Example insight categories:

calories
protein
fiber
water

Insights contain a category and severity level so the frontend can present the feedback appropriately.

Daily Balance Score

NutriFlow provides an explainable Daily Balance Score from 0 to 100.

The score evaluates several nutrition and hydration categories.

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

Example:

Balance Score: 43 / 100

Calories        10 / 25
Protein         10 / 20
Carbohydrates    8 / 15
Fat              8 / 15
Fiber            5 / 15
Water            2 / 10

The important part of the Balance Score is that the user can see why the score was given instead of receiving only one unexplained number.

Nutrition Calculations

NutriFlow calculates personalized nutrition targets from the user's nutrition profile.

The system considers:

Age

Gender

Height

Weight

Activity level

Nutrition goal

The calculated targets include:

Daily calories

Protein

Carbohydrates

Fat

Fiber

Hydration

The general flow is:

User Nutrition Profile
        |
        v
Backend Nutrition Calculator
        |
        v
Personalized Daily Targets
        |
        +---- Calories
        +---- Protein
        +---- Carbohydrates
        +---- Fat
        +---- Fiber
        +---- Water
        |
        v
Angular Frontend

These targets are used by:

Dashboard

Food Diary

Goals

Progress

Personalized Insights

Daily Balance Score

Recipe-related features

API Endpoints

Base URL:

http://localhost:5000/api

Protected endpoints require:

Authorization: Bearer <JWT_TOKEN>

Authentication — /api/auth

Method

Endpoint

Access

Description

POST

/register

Public

Register a user

POST

/login

Public

Login and receive JWT

GET

/me

Protected

Get authenticated user

Foods — /api/foods

Method

Endpoint

Access

Description

GET

/

Public

Get foods

GET

/search

Protected

Search foods

GET

/:id

Public

Get a food

POST

/

Admin

Create a food

PUT

/:id

Admin

Update a food

DELETE

/:id

Admin

Delete a food

Food records can contain:

Name

Calories

Protein

Carbohydrates

Fat

Fiber

Vitamins

Nutrition — /api/nutrition

The nutrition system stores profile information used to calculate personalized targets.

Information

Purpose

Age

Personalization

Gender

Nutrition calculation

Height

Nutrition calculation

Weight

Nutrition calculation

Activity level

Energy requirement

Nutrition goal

Goal adjustment

Targets include:

Calories

Protein

Carbohydrates

Fat

Fiber

Hydration

Meals — /api/meals

Data

Description

Meal name

Name of the meal

Meal type

Breakfast/lunch/dinner/snack

Food

Selected food

Quantity

Consumed quantity

Calories

Calculated calories

Protein

Calculated protein

Carbohydrates

Calculated carbohydrates

Fat

Calculated fat

Fiber

Calculated fiber

Date

Meal date

Goals — /api/goals

Supports:

Creating goals

Viewing goals

Updating goals

Managing the active goal

Progress — /api/progress

Provides:

Starting weight

Current weight

Target weight

Weight change

Progress percentage

Weight history

Recipes — /api/recipes

Supports recipe information and recipe management.

Recipe Suggestions

Ingredient-based recipe suggestions compare the user's available ingredients with recipe ingredients and calculate match percentages.

Water — /api/water

Supports:

Adding water

Viewing water totals

Viewing water history

Deleting water entries

Lifestyle — /api/lifestyle

Supports lifestyle information including:

Sleep hours

Activity minutes

Lifestyle history

Add/update/delete operations

Insights — /api/insights

Returns personalized nutrition and wellness feedback based on the user's tracked information.

Balance Score — /api/balance

Returns the user's daily Balance Score together with its detailed nutrition/hydration breakdown.

Data Flow Examples

Example 1 — User Login

1. User enters email and password
        |
        v
2. Angular validates the form
        |
        v
3. POST /api/auth/login
        |
        v
4. Express receives request
        |
        v
5. Credentials are validated
        |
        v
6. Password is checked with bcrypt
        |
        v
7. JWT is generated
        |
        v
8. Angular stores authentication state
        |
        v
9. User enters protected NutriFlow pages

Example 2 — Adding a Meal

1. User selects a food
        |
        v
2. User enters quantity
        |
        v
3. Angular validates the input
        |
        v
4. Frontend sends HTTP request
        |
        v
5. Express receives the request
        |
        v
6. Backend validates the data
        |
        v
7. Nutrition values are calculated
        |
        v
8. Meal is stored in MongoDB
        |
        v
9. Backend returns JSON
        |
        v
10. Angular updates the Food Diary

Example 3 — Nutrition Lookup

1. User searches for "rice"
        |
        v
2. Angular sends food-search request
        |
        v
3. Backend searches local food records
        |
        +---- Found ----> Return local result
        |
        +---- Not found -> Search USDA
                              |
                              v
                       Normalize result
                              |
                              v
                         Return result
                              |
                              v
4. User selects food
        |
        v
5. User changes serving size
        |
        v
6. Nutrition values are recalculated
        |
        v
7. Values are displayed

Nutrition Lookup remains informational and does not automatically create a Food Diary record.

Example 4 — Recipe Suggestions

1. User enters available ingredients
        |
        v
2. Angular sends ingredients to backend
        |
        v
3. Backend searches recipe sources
        |
        v
4. Recipes are normalized
        |
        v
5. Ingredients are compared
        |
        v
6. Matching and missing ingredients are identified
        |
        v
7. Match percentage is calculated
        |
        v
8. Recipes are ranked
        |
        v
9. Angular displays recipe cards

Security

NutriFlow implements multiple security measures.

Authentication

JWT authentication

Protected routes

Token verification

Token expiration

Password Security

bcryptjs password hashing

Passwords are not returned in normal API responses

Password validation

Password comparison during login

Authorization

User/admin roles

Admin-only operations

User ownership checks

Protected resources

API Security

Helmet security headers

CORS configuration

Rate limiting

Request body size limits

Input validation

MongoDB ObjectId validation

Disabled x-powered-by header

Validation & Error Handling

Incoming data is validated before processing.

Validation can cover:

Food names

Calories

Protein

Carbohydrates

Fat

Fiber

Vitamins

Nutrition profile information

Meal types

Quantities

Dates

MongoDB IDs

Password requirements

Example validation response:

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

NutriFlow uses centralized error handling for common errors.

Common status codes include:

200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error

Unknown API routes return a structured error response.

External APIs

USDA FoodData Central

NutriFlow can use USDA FoodData Central to retrieve nutritional information for foods that are not available in the local database.

The search strategy is:

User searches for food
        |
        v
Search NutriFlow MongoDB
        |
        v
Food found?
   /          \
 YES           NO
  |             |
  v             v
Return       Search USDA
food             |
                 v
          Normalize nutrition
                 |
                 v
            Return results

The application prioritizes standard/basic USDA food data before falling back to branded food data.

External Recipe API

The frontend does not directly communicate with the external recipe provider.

Instead:

Angular Frontend
       |
       v
NutriFlow Backend
       |
       v
Recipe API Service
       |
       v
External Recipe API

The backend service normalizes external recipe information before returning it to the frontend.

This keeps external API credentials and integration logic on the backend.

Testing with Postman

The NutriFlow backend has been tested using Postman.

Testing includes:

User registration

User login

JWT authentication

Protected routes

Authorization

Food retrieval

Food search

Food creation

Food update

Food deletion

Nutrition profile

Meal tracking

Goal management

Weight tracking

Progress calculation

Recipe management

Recipe suggestions

External recipe API integration

Water tracking

Lifestyle tracking

Personalized insights

Balance Score

For protected endpoints, include:

Authorization: Bearer <JWT_TOKEN>

Environment Variables

The backend uses environment variables for private configuration.

Create:

Backend/.env

Example:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
USDA_API_KEY=your_usda_api_key

Never commit the .env file to GitHub.

The repository .gitignore protects environment files and other generated/private files.

Frontend Development

The frontend is an Angular 22 application using standalone components.

The main application areas include:

Dashboard
Food Diary
AI Food Scanner
Recipes
Nutrition Lookup
Meal Planner
Water
Goals
Settings
Profile

Angular Router handles navigation between pages.

The application also uses reusable shared components, including the NutriFlow sidebar.

Generate a Component

ng generate component component-name

Short form:

ng g c component-name

Example:

ng generate component features/example

Development Server

ng serve

Open:

http://localhost:4200

Production Build

ng build

The Angular production output is generated in the dist/ directory.

Git & GitHub

The repository is organized so that the backend and frontend are clearly separated:

NutriFlow project/
├── Backend/
└── frontend/

The repository ignores:

node_modules/
.env
.env.*
uploads/
*.zip

This prevents dependencies, private environment variables, uploaded files, and local ZIP backups from being committed.

Before pushing changes:

git status

Stage changes:

git add -A

Commit:

git commit -m "Describe your changes"

Push:

git push origin main

Future Enhancements

Possible future improvements include:

More advanced AI Food Scanner functionality

Improved food recognition and nutrition extraction

More detailed nutrition charts

Advanced progress visualizations

Improved meal-planning interactions

Calendar-based meal planning

More recipe filtering

More advanced recipe personalization

More external food and recipe data sources

Improved recipe nutrition calculations

More advanced ingredient recommendation algorithms

More detailed wellness analytics

Automated unit and integration testing

End-to-end testing

Swagger/OpenAPI documentation

Improved logging and monitoring

Database indexing and performance optimization

Production deployment and cloud hosting

Improved mobile navigation

Accessibility improvements

Progressive Web App functionality

Offline-friendly features

NutriFlow Development Summary

NutriFlow combines a modern Angular frontend with a Node.js/Express backend.

                         NUTRIFLOW
                             |
                    Angular 22 Frontend
                             |
          +------------------+------------------+
          |                  |                  |
          v                  v                  v
      Dashboard         Food Diary          Recipes
          |                  |                  |
          +------------------+------------------+
                             |
                             v
                         REST API
                             |
                             v
                     Node.js / Express
                             |
              +--------------+--------------+
              |                             |
              v                             v
        MongoDB Atlas                  External APIs
                                            |
                                  +---------+---------+
                                  |                   |
                                  v                   v
                                USDA             Recipe API

The frontend provides the complete user-facing NutriFlow experience, while the backend provides:

Authentication

Authorization

Database operations

Nutrition calculations

Food data

Meal tracking

Goals

Progress

Water tracking

Lifestyle tracking

Recipes

Recipe suggestions

Personalized insights

Daily Balance Score

External API integrations

NutriFlow is designed around one core idea:

Make nutrition and wellness tracking more personalized, understandable, and actionable for the user.