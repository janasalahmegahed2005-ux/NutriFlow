import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar';

interface FoodResult {
  _id?: string;
  fdcId?: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

@Component({
  selector: 'app-nutrition-lookup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent
  ],
  templateUrl: './nutrition-lookup.html',
  styleUrl: './nutrition-lookup.css'
})
export class NutritionLookupComponent {

  searchQuery = '';
  searchResults: FoodResult[] = [];
  selectedFood: FoodResult | null = null;
  loading = false;
  searched = false;
  errorMessage = '';
  servingSize = 100;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // ======================================================
  // USER NAME
  // ======================================================

  get firstName(): string {
    return this.authService.getUser()?.firstName || 'User';
  }

  // ======================================================
  // SEARCH FOOD
  // ======================================================

  searchFoods(): void {

    const query = this.searchQuery.trim();

    if (query.length < 2) {
      this.errorMessage = 'Please enter at least 2 characters.';
      this.searchResults = [];
      this.selectedFood = null;
      return;
    }

    this.loading = true;
    this.searched = true;
    this.errorMessage = '';
    this.selectedFood = null;

    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url =
      `http://localhost:5000/api/foods/search?query=${encodeURIComponent(query)}`;

    this.http.get<any>(url, { headers }).subscribe({

      next: (response: any) => {
        const foods = response?.foods || [];
        this.searchResults = foods.map((food: any) => this.normalizeFood(food));
        this.loading = false;
        if (this.searchResults.length === 0) {
          this.errorMessage = 'No nutrition information found for this food.';
        }
        this.cdr.detectChanges();
      },

      error: (error: any) => {
        console.error('Nutrition lookup error:', error);
        this.searchResults = [];
        this.loading = false;
        this.errorMessage = 'Unable to search. Please try again.';
        this.cdr.detectChanges();
      }

    });
  }

  // ======================================================
  // NORMALIZE FOOD
  // ======================================================

  private normalizeFood(food: any): FoodResult {

    if (food && food.calories !== undefined) {
      return {
        _id: food._id,
        name: food.name || food.description || 'Unknown food',
        calories: Number(food.calories) || 0,
        protein: Number(food.protein) || 0,
        carbs: Number(food.carbs) || 0,
        fat: Number(food.fat) || 0,
        fiber: Number(food.fiber) || 0
      };
    }

    if (food && food.nutrition) {
      return {
        fdcId: food.fdcId,
        name: food.name || food.description || 'Unknown food',
        calories: Number(food.nutrition.calories) || 0,
        protein: Number(food.nutrition.protein) || 0,
        carbs: Number(food.nutrition.carbs) || 0,
        fat: Number(food.nutrition.fat) || 0,
        fiber: Number(food.nutrition.fiber) || 0
      };
    }

    return {
      name: food?.name || food?.description || 'Unknown food',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };
  }

  // ======================================================
  // SELECT FOOD
  // ======================================================

  selectFood(food: FoodResult): void {
    this.selectedFood = food;
    this.searchResults = [];
    this.servingSize = 100;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  // ======================================================
  // CLEAR SEARCH
  // ======================================================

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedFood = null;
    this.searched = false;
    this.errorMessage = '';
    this.servingSize = 100;
  }

  // ======================================================
  // QUICK SEARCH
  // ======================================================

  quickSearch(food: string): void {
    this.searchQuery = food;
    this.searchFoods();
  }

  // ======================================================
  // NUTRITION CALCULATIONS
  // ======================================================

  private getMultiplier(): number {
    return this.servingSize / 100;
  }

  get calculatedCalories(): number {
    if (!this.selectedFood) return 0;
    return Math.round(this.selectedFood.calories * this.getMultiplier());
  }

  get calculatedProtein(): number {
    if (!this.selectedFood) return 0;
    return Math.round(this.selectedFood.protein * this.getMultiplier() * 10) / 10;
  }

  get calculatedCarbs(): number {
    if (!this.selectedFood) return 0;
    return Math.round(this.selectedFood.carbs * this.getMultiplier() * 10) / 10;
  }

  get calculatedFat(): number {
    if (!this.selectedFood) return 0;
    return Math.round(this.selectedFood.fat * this.getMultiplier() * 10) / 10;
  }

  get calculatedFiber(): number {
    if (!this.selectedFood) return 0;
    return Math.round(this.selectedFood.fiber * this.getMultiplier() * 10) / 10;
  }

}