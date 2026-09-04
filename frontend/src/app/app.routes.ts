import { Routes } from '@angular/router';


import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { FoodDiaryComponent } from './features/food-diary/food-diary';
import { RecipesComponent } from './features/recipes/recipes';

import { NutritionLookupComponent } from './features/nutrition-lookup/nutrition-lookup';


export const routes: Routes = [

  // =====================================================
  // AUTH
  // =====================================================

  {
    path: 'login',
component: Login  },

  {
    path: 'register',
component: Register  },


  // =====================================================
  // MAIN PAGES
  // =====================================================

  {
    path: 'dashboard',
component: Dashboard  },

  {
    path: 'food-diary',
    component: FoodDiaryComponent
  },

  {
    path: 'recipes',
    component: RecipesComponent
  },


  // =====================================================
  // NUTRITION LOOKUP
  // =====================================================

  {
    path: 'nutrition-lookup',
    component: NutritionLookupComponent
  },


  // =====================================================
  // DEFAULT ROUTE
  // =====================================================

  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },


  // =====================================================
  // FALLBACK
  // =====================================================

  {
    path: '**',
    redirectTo: '/dashboard'
  }

];