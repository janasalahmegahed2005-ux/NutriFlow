import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { FoodDiaryComponent } from './features/food-diary/food-diary';
import { RecipesComponent } from './features/recipes/recipes';
import { NutritionLookupComponent } from './features/nutrition-lookup/nutrition-lookup';
import { WaterComponent } from './features/water/water';
import { GoalsComponent } from './features/goals/goals';
import { SettingsComponent } from './features/settings/settings';
import { MealPlannerComponent } from './features/meal-planner/meal-planner';
import { MealPlannerDayComponent } from './features/meal-planner/meal-planner-day/meal-planner-day';
import { AiScannerComponent } from './features/ai-scanner/ai-scanner';
import { Profile } from './features/profile/profile';
import { AdminComponent } from './features/admin/admin';
import { adminGuard } from './guards/admin.guard';
import { AdminUserDetailsComponent } from './features/admin/admin-user-details';


import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  // AUTH
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // MAIN PAGES
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'food-diary', component: FoodDiaryComponent, canActivate: [authGuard] },
  { path: 'recipes', component: RecipesComponent, canActivate: [authGuard] },
  { path: 'nutrition-lookup', component: NutritionLookupComponent, canActivate: [authGuard] },
  { path: 'water', component: WaterComponent, canActivate: [authGuard] },
  { path: 'goals', component: GoalsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  {path: 'meal-planner',component: MealPlannerComponent,canActivate: [authGuard],children: [
  { path: 'day/:date',  component: MealPlannerDayComponent} ] },
  { path: 'ai-scanner', component: AiScannerComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard]  },
  { path: 'admin/users/:userId', component: AdminUserDetailsComponent, canActivate: [adminGuard] },

  // DEFAULT
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // FALLBACK
  { path: '**', redirectTo: '/login' }

];