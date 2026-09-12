import { ChangeDetectorRef, Component, OnInit } from '@angular/core';import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SidebarComponent } from '../../shared/sidebar';
import {
  MealPlan,
  MealPlanService
} from '../../services/meal-plan.service';

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent
  ],
  templateUrl: './meal-planner.html',
  styleUrl: './meal-planner.css'
})
export class MealPlannerComponent implements OnInit {

  // ==========================================
  // MEAL PLANS
  // ==========================================

  mealPlans: MealPlan[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  // ==========================================
  // WEEK
  // ==========================================

  currentWeekStart: Date = this.getStartOfWeek(new Date());

  weekDays: Date[] = [];

  selectedDate: Date = new Date();

  // ==========================================
  // FORM
  // ==========================================

  showForm = false;
  editingMealId: string | null = null;

  mealForm: MealPlan = this.createEmptyMeal();

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
  private mealPlanService: MealPlanService,
  private cdr: ChangeDetectorRef
) {}


  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {
    this.generateWeek();
    this.loadMealPlans();
  }

  // ==========================================
  // CREATE EMPTY MEAL
  // ==========================================

  createEmptyMeal(): MealPlan {
    return {
      name: '',
      mealType: 'breakfast',
      quantity: 1,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      vitamins: [],
      date: this.formatDate(new Date())
    };
  }

  // ==========================================
  // LOAD MEAL PLANS
  // ==========================================

 loadMealPlans(): void {
  this.loading = true;
  this.errorMessage = '';

  this.mealPlanService.getMealPlans().subscribe({
    next: (response) => {
      this.mealPlans = response.mealPlans || [];
      this.loading = false;

      this.cdr.detectChanges();
    },

    error: (error) => {
      console.error('Failed to load meal plans:', error);

      this.errorMessage =
        'Unable to load your meal plans. Please try again.';

      this.loading = false;

      this.cdr.detectChanges();
    }
  });
}

  // ==========================================
  // GENERATE CURRENT WEEK
  // ==========================================

  generateWeek(): void {
    this.weekDays = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(this.currentWeekStart);

      day.setDate(
        this.currentWeekStart.getDate() + i
      );

      this.weekDays.push(day);
    }
  }

  // ==========================================
  // PREVIOUS WEEK
  // ==========================================

  previousWeek(): void {
    const newDate = new Date(this.currentWeekStart);

    newDate.setDate(
      newDate.getDate() - 7
    );

    this.currentWeekStart = newDate;

    this.generateWeek();
  }

  // ==========================================
  // NEXT WEEK
  // ==========================================

  nextWeek(): void {
    const newDate = new Date(this.currentWeekStart);

    newDate.setDate(
      newDate.getDate() + 7
    );

    this.currentWeekStart = newDate;

    this.generateWeek();
  }

  // ==========================================
  // GO TO CURRENT WEEK
  // ==========================================

  goToToday(): void {
    this.currentWeekStart =
      this.getStartOfWeek(new Date());

    this.selectedDate = new Date();

    this.generateWeek();
  }

  // ==========================================
  // SELECT DAY
  // ==========================================

  selectDate(date: Date): void {
    this.selectedDate = new Date(date);
  }

  // ==========================================
  // CHECK SELECTED DAY
  // ==========================================

  isSelectedDate(date: Date): boolean {
    return this.isSameDay(
      date,
      this.selectedDate
    );
  }

  // ==========================================
  // CHECK TODAY
  // ==========================================

  isToday(date: Date): boolean {
    return this.isSameDay(
      date,
      new Date()
    );
  }

  // ==========================================
  // GET MEALS FOR SELECTED DAY
  // ==========================================

  getMealsForSelectedDay(): MealPlan[] {
    return this.mealPlans.filter((meal) =>
      this.isSameDay(
        new Date(meal.date),
        this.selectedDate
      )
    );
  }

  // ==========================================
  // GET MEALS BY TYPE
  // ==========================================

  getMealsByType(
    mealType: MealPlan['mealType']
  ): MealPlan[] {
    return this.getMealsForSelectedDay()
      .filter(
        meal => meal.mealType === mealType
      );
  }

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  openAddForm(): void {
    this.editingMealId = null;

    this.mealForm = {
      ...this.createEmptyMeal(),
      date: this.formatDate(
        this.selectedDate
      )
    };

    this.errorMessage = '';
    this.successMessage = '';

    this.showForm = true;
  }

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  openEditForm(meal: MealPlan): void {
    this.editingMealId = meal._id || null;

    this.mealForm = {
      ...meal
    };

    this.errorMessage = '';
    this.successMessage = '';

    this.showForm = true;
  }

  // ==========================================
  // CLOSE FORM
  // ==========================================

  closeForm(): void {
    if (this.saving) {
      return;
    }

    this.showForm = false;
    this.editingMealId = null;
  }

  // ==========================================
  // SAVE MEAL
  // ==========================================

  saveMeal(): void {

    if (!this.mealForm.name.trim()) {
      this.errorMessage =
        'Please enter a meal name.';

      return;
    }

    if (
      this.mealForm.calories < 0 ||
      this.mealForm.protein < 0 ||
      this.mealForm.carbs < 0 ||
      this.mealForm.fat < 0 ||
      this.mealForm.fiber < 0
    ) {
      this.errorMessage =
        'Nutrition values cannot be negative.';

      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const mealData: MealPlan = {
      name: this.mealForm.name.trim(),
      mealType: this.mealForm.mealType,
      quantity: Number(this.mealForm.quantity) || 0,
      calories: Number(this.mealForm.calories) || 0,
      protein: Number(this.mealForm.protein) || 0,
      carbs: Number(this.mealForm.carbs) || 0,
      fat: Number(this.mealForm.fat) || 0,
      fiber: Number(this.mealForm.fiber) || 0,
      vitamins: this.mealForm.vitamins || [],
      date: this.mealForm.date
    };

    if (this.editingMealId) {

      this.mealPlanService
        .updateMealPlan(
          this.editingMealId,
          mealData
        )
        .subscribe({
          next: () => {

            this.saving = false;

            this.successMessage =
              'Meal plan updated successfully.';

            this.showForm = false;
            this.editingMealId = null;

            this.loadMealPlans();
          },

          error: (error) => {

            console.error(
              'Failed to update meal plan:',
              error
            );

            this.errorMessage =
              error?.error?.message ||
              'Failed to update meal plan.';

            this.saving = false;
          }
        });

    } else {

      this.mealPlanService
        .createMealPlan(mealData)
        .subscribe({
          next: () => {

            this.saving = false;

            this.successMessage =
              'Meal planned successfully.';

            this.showForm = false;

            this.loadMealPlans();
          },

          error: (error) => {

            console.error(
              'Failed to create meal plan:',
              error
            );

            this.errorMessage =
              error?.error?.message ||
              'Failed to create meal plan.';

            this.saving = false;
          }
        });
    }
  }

  // ==========================================
  // DELETE MEAL
  // ==========================================

  deleteMeal(meal: MealPlan): void {

    if (!meal._id) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${meal.name}" from your meal plan?`
      );

    if (!confirmed) {
      return;
    }

    this.mealPlanService
      .deleteMealPlan(meal._id)
      .subscribe({
        next: () => {

          this.successMessage =
            'Meal removed from your plan.';

          this.loadMealPlans();
        },

        error: (error) => {

          console.error(
            'Failed to delete meal plan:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to delete meal plan.';
        }
      });
  }

  // ==========================================
  // WEEK RANGE TITLE
  // ==========================================

  getWeekRange(): string {

    if (!this.weekDays.length) {
      return '';
    }

    const first = this.weekDays[0];
    const last = this.weekDays[6];

    const firstMonth =
      first.toLocaleDateString(
        'en-US',
        { month: 'short' }
      );

    const lastMonth =
      last.toLocaleDateString(
        'en-US',
        { month: 'short' }
      );

    if (firstMonth === lastMonth) {
      return `${firstMonth} ${first.getDate()} – ${last.getDate()}, ${last.getFullYear()}`;
    }

    return `${firstMonth} ${first.getDate()} – ${lastMonth} ${last.getDate()}, ${last.getFullYear()}`;
  }

  // ==========================================
  // TOTAL DAILY CALORIES
  // ==========================================

  getDailyCalories(): number {
    return this.getMealsForSelectedDay()
      .reduce(
        (total, meal) =>
          total + Number(meal.calories || 0),
        0
      );
  }

  // ==========================================
  // TOTAL DAILY PROTEIN
  // ==========================================

  getDailyProtein(): number {
    return this.getMealsForSelectedDay()
      .reduce(
        (total, meal) =>
          total + Number(meal.protein || 0),
        0
      );
  }

  // ==========================================
  // TOTAL DAILY CARBS
  // ==========================================

  getDailyCarbs(): number {
    return this.getMealsForSelectedDay()
      .reduce(
        (total, meal) =>
          total + Number(meal.carbs || 0),
        0
      );
  }

  // ==========================================
  // TOTAL DAILY FAT
  // ==========================================

  getDailyFat(): number {
    return this.getMealsForSelectedDay()
      .reduce(
        (total, meal) =>
          total + Number(meal.fat || 0),
        0
      );
  }

  // ==========================================
  // DATE HELPERS
  // ==========================================

  getStartOfWeek(date: Date): Date {

    const result = new Date(date);

    const day = result.getDay();

    const difference =
      day === 0 ? -6 : 1 - day;

    result.setDate(
      result.getDate() + difference
    );

    result.setHours(
      0,
      0,
      0,
      0
    );

    return result;
  }

  isSameDay(
    firstDate: Date,
    secondDate: Date
  ): boolean {

    return (
      firstDate.getFullYear() ===
        secondDate.getFullYear() &&
      firstDate.getMonth() ===
        secondDate.getMonth() &&
      firstDate.getDate() ===
        secondDate.getDate()
    );
  }

  formatDate(date: Date): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // ==========================================
  // DISPLAY HELPERS
  // ==========================================

  getMealTypeLabel(
    mealType: MealPlan['mealType']
  ): string {

    const labels = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack'
    };

    return labels[mealType];
  }

  getMealTypeIcon(
    mealType: MealPlan['mealType']
  ): string {

    const icons = {
      breakfast: '☀',
      lunch: '🥗',
      dinner: '🍽',
      snack: '🍎'
    };

    return icons[mealType];
  }
}