import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface RecipeSuggestion {
  source?: 'nutriflow' | 'spoonacular';

  recipe: {
    _id: string;
    name: string;
    description?: string;
    mealType: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    instructions?: string;
    image?: string | null;
  };

  matchedIngredients: string[];
  missingIngredients: string[];
  matchedCount: number;
  totalIngredients: number;
  matchPercentage: number;
}

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './recipes.html',
  styleUrl: './recipes.css'
})
export class RecipesComponent implements OnInit {

  user: any = null;
  ingredientInput = '';
  ingredientsList: string[] = [];
  suggestions: RecipeSuggestion[] = [];
  loading = false;
  searched = false;
  errorMessage = '';
  selectedSuggestion: RecipeSuggestion | null = null;

  recipeImages: { [key: string]: string } = {
    breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&q=80',
    lunch: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    dinner: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80',
    snack: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=400&q=80',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {}

  get firstName(): string {
    return this.user?.firstName || 'User';
  }

  addIngredient(): void {
    const ingredient = this.ingredientInput.trim().toLowerCase();

    if (!ingredient) return;

    if (this.ingredientsList.includes(ingredient)) {
      this.ingredientInput = '';
      return;
    }

    this.ingredientsList = [...this.ingredientsList, ingredient];
    this.ingredientInput = '';
    this.cdr.detectChanges();
  }

  removeIngredient(ingredient: string): void {
    this.ingredientsList = this.ingredientsList.filter(
      i => i !== ingredient
    );

    this.cdr.detectChanges();
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addIngredient();
    }
  }

  searchRecipes(): void {
    if (this.ingredientsList.length === 0) return;

    this.loading = true;
    this.searched = false;
    this.errorMessage = '';
    this.suggestions = [];

    this.cdr.detectChanges();

    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post<any>(
      'http://localhost:5000/api/recipes/suggestions',
      {
        ingredients: this.ingredientsList
      },
      {
        headers
      }
    ).subscribe({
      next: (response: any) => {

        console.log('RECIPE API RESPONSE:', response);

        this.suggestions = response.suggestions || [];

        this.loading = false;
        this.searched = true;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.log('RECIPE API ERROR:', error);
        console.log('STATUS:', error.status);
        console.log('ERROR BODY:', error.error);

        this.errorMessage =
          error.error?.message ||
          `Failed to find recipes. Server returned ${error.status}.`;

        this.loading = false;
        this.searched = true;

        this.cdr.detectChanges();
      }
    });
  }

  clearAll(): void {
    this.ingredientsList = [];
    this.suggestions = [];
    this.searched = false;
    this.errorMessage = '';
    this.ingredientInput = '';
    this.selectedSuggestion = null;

    this.cdr.detectChanges();
  }

  openRecipe(suggestion: RecipeSuggestion): void {
    this.selectedSuggestion = suggestion;

    this.cdr.detectChanges();
  }

  closeRecipe(): void {
    this.selectedSuggestion = null;

    this.cdr.detectChanges();
  }

  // Use Spoonacular's real image when available.
  // Otherwise use the existing NutriFlow fallback image.
  getRecipeImage(recipe: RecipeSuggestion['recipe']): string {

    if (recipe.image) {
      return recipe.image;
    }

    return this.recipeImages[recipe.mealType] ||
           this.recipeImages['lunch'];
  }

  getMealTypeLabel(mealType: string): string {

    const labels: { [key: string]: string } = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack'
    };

    return labels[mealType] || mealType;
  }

  getMealTypeIcon(mealType: string): string {

    const icons: { [key: string]: string } = {
      breakfast: '☀',
      lunch: '◉',
      dinner: '◐',
      snack: '♡'
    };

    return icons[mealType] || '✦';
  }

  getMatchColor(pct: number): string {

    if (pct >= 80) return '#405c36';
    if (pct >= 50) return '#e7b08e';

    return '#d7a6ad';
  }

  onImageError(event: Event): void {

    const img = event.target as HTMLImageElement;

    img.style.display = 'none';
  }

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);
  }
}