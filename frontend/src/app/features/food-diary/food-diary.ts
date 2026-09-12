import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MealService } from '../../services/meal';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar';

interface Meal {
  _id?: string;
  name: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food?: string;
  quantity?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  vitamins?: string[];
  date?: string;
}

interface FoodResult {
  _id?: string;
  fdcId?: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

@Component({
  selector: 'app-food-diary',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './food-diary.html',
  styleUrl: './food-diary.css'
})
export class FoodDiaryComponent implements OnInit {

  meals: Meal[] = [];
  loading = true;
  errorMessage = '';
  selectedDate = this.getTodayDate();
  mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  showModal = false;
  searchQuery = '';
  searchResults: FoodResult[] = [];
  searchLoading = false;
  selectedFood: FoodResult | null = null;
  selectedMealType: string = 'Breakfast';
  quantity: number = 100;
  saving = false;
  private searchTimeout: any = null;

  constructor(
    private mealService: MealService,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadMeals(); }

  get previewCalories(): number {
    if (!this.selectedFood) return 0;
    return Math.round((this.selectedFood.calories * this.quantity) / 100);
  }

  get previewProtein(): number {
    if (!this.selectedFood) return 0;
    return Math.round((this.selectedFood.protein * this.quantity) / 100 * 10) / 10;
  }

  get previewCarbs(): number {
    if (!this.selectedFood) return 0;
    return Math.round((this.selectedFood.carbs * this.quantity) / 100 * 10) / 10;
  }

  get previewFat(): number {
    if (!this.selectedFood) return 0;
    return Math.round((this.selectedFood.fat * this.quantity) / 100 * 10) / 10;
  }

  get previewFiber(): number {
    if (!this.selectedFood || !this.selectedFood.fiber) return 0;
    return Math.round((this.selectedFood.fiber * this.quantity) / 100 * 10) / 10;
  }

  loadMeals(): void {
    this.loading = true;
    this.errorMessage = '';
    this.meals = [];
    this.cdr.detectChanges();
    this.mealService.getMeals(this.selectedDate).subscribe({
      next: (response: any) => {
        this.meals = response?.meals || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.errorMessage = error?.error?.message || 'Failed to load your meals. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openModal(): void {
    this.showModal = true;
    this.searchQuery = '';
    this.searchResults = [];
    this.searchLoading = false;
    this.selectedFood = null;
    this.quantity = 100;
    this.selectedMealType = 'Breakfast';
    this.saving = false;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.searchLoading = false;
    this.cdr.detectChanges();
  }

  selectMealType(type: string): void {
    this.selectedMealType = type;
    this.cdr.detectChanges();
  }

  onSearchInput(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    const query = this.searchQuery?.trim() || '';
    if (query.length < 2) {
      this.searchResults = [];
      this.searchLoading = false;
      this.selectedFood = null;
      this.cdr.detectChanges();
      return;
    }
    this.searchTimeout = setTimeout(() => { this.searchFoods(); }, 400);
  }

  searchFoods(): void {
    const query = this.searchQuery?.trim() || '';
    if (query.length < 2) { this.searchResults = []; this.searchLoading = false; return; }
    this.searchLoading = true;
    this.selectedFood = null;
    this.cdr.detectChanges();
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const url = `http://localhost:5000/api/foods/search?query=${encodeURIComponent(query)}`;
    this.http.get<any>(url, { headers }).subscribe({
      next: (response: any) => {
        this.searchResults = (response?.foods || []).map((food: any) => this.normalizeFood(food));
        this.searchLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.searchResults = []; this.searchLoading = false; this.cdr.detectChanges(); }
    });
  }

  private normalizeFood(food: any): FoodResult {
    if (food && food.calories !== undefined) {
      return { _id: food._id, name: food.name || food.description || 'Unknown food', calories: Number(food.calories) || 0, protein: Number(food.protein) || 0, carbs: Number(food.carbs) || 0, fat: Number(food.fat) || 0, fiber: Number(food.fiber) || 0 };
    }
    if (food && food.nutrition) {
      return { fdcId: food.fdcId, name: food.name || food.description || 'Unknown food', calories: Number(food.nutrition.calories) || 0, protein: Number(food.nutrition.protein) || 0, carbs: Number(food.nutrition.carbs) || 0, fat: Number(food.nutrition.fat) || 0, fiber: Number(food.nutrition.fiber) || 0 };
    }
    return { name: food?.name || food?.description || 'Unknown food', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  }

  selectFood(food: FoodResult): void {
    this.selectedFood = food;
    this.searchQuery = food.name;
    this.searchResults = [];
    this.searchLoading = false;
    this.cdr.detectChanges();
  }

  addMeal(): void {
    if (!this.selectedFood || !this.quantity || this.quantity <= 0 || this.saving) return;
    this.saving = true;
    this.cdr.detectChanges();
    const meal: any = {
      name: this.selectedFood.name,
      mealType: this.selectedMealType.toLowerCase(),
      quantity: Number(this.quantity),
      calories: this.previewCalories,
      protein: this.previewProtein,
      carbs: this.previewCarbs,
      fat: this.previewFat,
      fiber: this.previewFiber,
      date: this.selectedDate
    };
    if (this.selectedFood._id && this.selectedFood._id.trim() !== '') meal.food = this.selectedFood._id;
    this.mealService.createMeal(meal).subscribe({
      next: (response: any) => {
        if (response?.meal) this.meals = [...this.meals, response.meal];
        this.saving = false;
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.saving = false;
        this.errorMessage = error?.error?.message || 'Failed to add the meal. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  changeDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.value) return;
    this.selectedDate = input.value;
    this.loadMeals();
  }

  getMealsByType(type: string): Meal[] {
    return this.meals.filter(meal => meal.mealType?.toLowerCase() === type.toLowerCase());
  }

  getTotalCalories(): number { return this.roundNumber(this.meals.reduce((t, m) => t + (Number(m.calories) || 0), 0)); }
  getTotalProtein(): number { return this.roundNumber(this.meals.reduce((t, m) => t + (Number(m.protein) || 0), 0)); }
  getTotalCarbs(): number { return this.roundNumber(this.meals.reduce((t, m) => t + (Number(m.carbs) || 0), 0)); }
  getTotalFat(): number { return this.roundNumber(this.meals.reduce((t, m) => t + (Number(m.fat) || 0), 0)); }

  deleteMeal(meal: Meal): void {
    if (!meal._id) return;
    if (!confirm(`Are you sure you want to delete "${meal.name}"?`)) return;
    this.mealService.deleteMeal(meal._id).subscribe({
      next: () => { this.meals = this.meals.filter(item => item._id !== meal._id); this.cdr.detectChanges(); },
      error: (error: any) => { this.errorMessage = error?.error?.message || 'Failed to delete the meal.'; this.cdr.detectChanges(); }
    });
  }

  refreshMeals(): void { this.loadMeals(); }

  onImageError(event: Event): void { const img = event.target as HTMLImageElement; img.style.display = 'none'; }

  getFoodImage(foodName: string): string {
    const name = (foodName || '').toLowerCase().trim();
    if (name.includes('kofta') || name.includes('kebab') || name.includes('kabob')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=85';
    if (name.includes('chicken')) return 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=300&q=85';
    if (name.includes('salmon')) return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=300&q=85';
    if (name.includes('tuna')) return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=300&q=85';
    if (name.includes('avocado')) return 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&q=85';
    if (name.includes('apple')) return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&q=85';
    if (name.includes('banana')) return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=300&q=85';
    if (name.includes('strawberry')) return 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=300&q=85';
    if (name.includes('blueberry')) return 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=300&q=85';
    if (name.includes('orange') || name.includes('mandarin') || name.includes('tangerine')) return 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=300&q=85';
    if (name.includes('grape')) return 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=300&q=85';
    if (name.includes('watermelon')) return 'https://images.unsplash.com/photo-1563114773-84221bd62daa?auto=format&fit=crop&w=300&q=85';
    if (name.includes('mango')) return 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=300&q=85';
    if (name.includes('sushi') || name.includes('sashimi')) return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&q=85';
    if (name.includes('rice')) return 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=300&q=85';
    if (name.includes('tomato')) return 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=300&q=85';
    if (name.includes('potato')) return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=85';
    if (name.includes('fries')) return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=300&q=85';
    if (name.includes('broccoli')) return 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=300&q=85';
    if (name.includes('carrot')) return 'https://images.unsplash.com/photo-1447175008436-1701707530e1?auto=format&fit=crop&w=300&q=85';
    if (name.includes('spinach')) return 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=300&q=85';
    if (name.includes('salad')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=85';
    if (name.includes('egg') || name.includes('omelet') || name.includes('omelette')) return 'https://images.unsplash.com/photo-1510693206972-df098f0cbf06?auto=format&fit=crop&w=300&q=85';
    if (name.includes('oat')) return 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=300&q=85';
    if (name.includes('pancake')) return 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=300&q=85';
    if (name.includes('waffle')) return 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=300&q=85';
    if (name.includes('bagel')) return 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=300&q=85';
    if (name.includes('bread') || name.includes('toast')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=85';
    if (name.includes('chip')) return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=85';
    if (name.includes('pizza')) return 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=85';
    if (name.includes('pasta') || name.includes('spaghetti') || name.includes('macaroni') || name.includes('noodle')) return 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=300&q=85';
    if (name.includes('yogurt') || name.includes('yoghurt')) return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=85';
    if (name.includes('cheese')) return 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=300&q=85';
    if (name.includes('hummus')) return 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=300&q=85';
    if (name.includes('falafel')) return 'https://images.unsplash.com/photo-1593001872095-7d5b3868dd0b?auto=format&fit=crop&w=300&q=85';
    return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=85';
  }

  private roundNumber(value: number): number { return Math.round(value * 10) / 10; }

  private getTodayDate(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
}