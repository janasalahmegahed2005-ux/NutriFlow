import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar';


interface RecipeSuggestion {

  source?:
    | 'nutriflow'
    | 'themealdb'
    | 'spoonacular';

  externalId?: string;

  recipe: {

    _id: string;

    name: string;

    description?: string;

    mealType: string;

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

  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent
  ],

  templateUrl: './recipes.html',

  styleUrl: './recipes.css'

})


export class RecipesComponent
  implements OnInit {


  user: any = null;


  ingredientInput = '';

  ingredientsList: string[] = [];

  suggestions: RecipeSuggestion[] = [];

  loading = false;

  searched = false;

  errorMessage = '';

  successMessage = '';

  loggingMeal = false;

  selectedSuggestion:
    RecipeSuggestion | null = null;


  recipeImages: {
    [key: string]: string
  } = {

    breakfast:
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&q=80',

    lunch:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',

    dinner:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80',

    snack:
      'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=400&q=80',

  };


  constructor(

    private authService: AuthService,

    private http: HttpClient,

    private cdr: ChangeDetectorRef

  ) {

    this.user =
      this.authService.getUser();

  }


  ngOnInit(): void {}


  // ==========================================
  // USER
  // ==========================================

  get firstName(): string {

    return (
      this.user?.firstName ||
      'User'
    );

  }


  // ==========================================
  // ADD INGREDIENT
  // ==========================================

  addIngredient(): void {

    const ingredient =
      this.ingredientInput
        .trim()
        .toLowerCase();


    if (!ingredient) {
      return;
    }


    if (
      this.ingredientsList.includes(
        ingredient
      )
    ) {

      this.ingredientInput = '';

      return;

    }


    this.ingredientsList = [
      ...this.ingredientsList,
      ingredient
    ];


    this.ingredientInput = '';

    this.cdr.detectChanges();

  }


  // ==========================================
  // REMOVE INGREDIENT
  // ==========================================

  removeIngredient(
    ingredient: string
  ): void {

    this.ingredientsList =
      this.ingredientsList.filter(
        (item) =>
          item !== ingredient
      );

    this.cdr.detectChanges();

  }


  // ==========================================
  // KEYBOARD INPUT
  // ==========================================

  onInputKeydown(
    event: KeyboardEvent
  ): void {

    if (
      event.key === 'Enter' ||
      event.key === ','
    ) {

      event.preventDefault();

      this.addIngredient();

    }

  }


  // ==========================================
  // SEARCH RECIPES
  // ==========================================

  searchRecipes(): void {

    if (
      this.ingredientsList.length === 0
    ) {

      return;

    }


    this.loading = true;

    this.searched = false;

    this.errorMessage = '';

    this.successMessage = '';

    this.suggestions = [];


    this.cdr.detectChanges();


    const token =
      this.authService.getToken();


    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`,

        'Content-Type':
          'application/json'

      });


    this.http.post<any>(

      'http://localhost:5000/api/recipes/suggestions',

      {
        ingredients:
          this.ingredientsList
      },

      {
        headers
      }

    ).subscribe({

      next: (response: any) => {

        this.suggestions =
          response.suggestions || [];


        this.loading = false;

        this.searched = true;

        this.cdr.detectChanges();

      },


      error: (error) => {

        this.errorMessage =
          error.error?.message ||
          `Failed to find recipes. Server returned ${error.status}.`;


        this.loading = false;

        this.searched = true;

        this.cdr.detectChanges();

      }

    });

  }


  // ==========================================
  // CLEAR ALL
  // ==========================================

  clearAll(): void {

    this.ingredientsList = [];

    this.suggestions = [];

    this.searched = false;

    this.errorMessage = '';

    this.successMessage = '';

    this.ingredientInput = '';

    this.selectedSuggestion =
      null;

    this.loggingMeal = false;

    this.cdr.detectChanges();

  }


  // ==========================================
  // OPEN RECIPE
  // ==========================================

  openRecipe(
    suggestion: RecipeSuggestion
  ): void {

    this.selectedSuggestion =
      suggestion;

    this.successMessage = '';

    this.errorMessage = '';

    this.cdr.detectChanges();

  }


  // ==========================================
  // CLOSE RECIPE
  // ==========================================

  closeRecipe(): void {

    this.selectedSuggestion =
      null;

    this.successMessage = '';

    this.errorMessage = '';

    this.cdr.detectChanges();

  }


  // ==========================================
  // COOK & LOG YOUR MEAL
  //
  // Recipe nutrition is intentionally NOT
  // calculated anymore.
  //
  // The Food Diary endpoint still requires
  // nutrition fields, so they are sent as 0.
  // ==========================================

  addRecipeToDiary(): void {

    if (
      !this.selectedSuggestion ||
      this.loggingMeal
    ) {

      return;

    }


    this.loggingMeal = true;

    this.successMessage = '';

    this.errorMessage = '';


    const recipe =
      this.selectedSuggestion.recipe;


    const token =
      this.authService.getToken();


    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`,

        'Content-Type':
          'application/json'

      });


    const mealData = {

      name:
        recipe.name,

      mealType:
        recipe.mealType || 'dinner',

      calories:
        0,

      protein:
        0,

      carbs:
        0,

      fat:
        0,

      fiber:
        0,

      quantity:
        1,

      date:
        new Date()

    };


    this.http.post<any>(

      'http://localhost:5000/api/meals',

      mealData,

      { headers }

    ).subscribe({

      next: () => {

        this.loggingMeal = false;

        this.successMessage =
          'Recipe added to your Food Diary successfully!';

        this.cdr.detectChanges();

      },


      error: (error) => {

        this.loggingMeal = false;

        this.errorMessage =
          error.error?.message ||
          'Failed to add recipe to your Food Diary.';

        this.cdr.detectChanges();

      }

    });

  }


  // ==========================================
  // RECIPE IMAGE
  // ==========================================

  getRecipeImage(
    recipe: RecipeSuggestion['recipe']
  ): string {

    if (recipe.image) {

      return recipe.image;

    }


    return (
      this.recipeImages[
        recipe.mealType
      ] ||
      this.recipeImages['lunch']
    );

  }


  // ==========================================
  // MEAL TYPE LABEL
  // ==========================================

  getMealTypeLabel(
    mealType: string
  ): string {

    const labels: {
      [key: string]: string
    } = {

      breakfast:
        'Breakfast',

      lunch:
        'Lunch',

      dinner:
        'Dinner',

      snack:
        'Snack'

    };


    return (
      labels[mealType] ||
      mealType
    );

  }


  // ==========================================
  // MEAL TYPE ICON
  // ==========================================

  getMealTypeIcon(
    mealType: string
  ): string {

    const icons: {
      [key: string]: string
    } = {

      breakfast:
        '☀',

      lunch:
        '◉',

      dinner:
        '◐',

      snack:
        '♡'

    };


    return (
      icons[mealType] ||
      '✦'
    );

  }


  // ==========================================
  // MATCH COLOR
  // ==========================================

  getMatchColor(
    percentage: number
  ): string {

    if (percentage >= 80) {

      return '#405c36';

    }


    if (percentage >= 50) {

      return '#e7b08e';

    }


    return '#d7a6ad';

  }


  // ==========================================
  // IMAGE ERROR
  // ==========================================

  onImageError(
    event: Event
  ): void {

    const img =
      event.target as HTMLImageElement;

    img.style.display = 'none';

  }

}