import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, SidebarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  user: any = null;

  calories = 0;
  calorieTarget = 2000;
  protein = 0;
  proteinTarget = 120;
  carbs = 0;
  carbsTarget = 250;
  fat = 0;
  fatTarget = 65;

  meals: any[] = [];

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.user = this.authService.getUser();
    this.calorieTarget = this.user?.calorieTarget || 2000;
    this.proteinTarget = this.user?.proteinTarget || 120;
    this.carbsTarget = this.user?.carbsTarget || 250;
    this.fatTarget = this.user?.fatTarget || 65;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  get firstName(): string { return this.user?.firstName || 'User'; }

  get fullName(): string {
    if (!this.user) return 'User';
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  get formattedDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  get caloriePercentage(): number {
    if (!this.calorieTarget || this.calorieTarget <= 0) return 0;
    return Math.min(100, Math.round((this.calories / this.calorieTarget) * 100));
  }

  get caloriesRemaining(): number {
    return Math.max(0, this.calorieTarget - this.calories);
  }

  get proteinPercentage(): number {
    if (!this.proteinTarget || this.proteinTarget <= 0) return 0;
    return Math.min(100, (this.protein / this.proteinTarget) * 100);
  }

  get carbsPercentage(): number {
    if (!this.carbsTarget || this.carbsTarget <= 0) return 0;
    return Math.min(100, (this.carbs / this.carbsTarget) * 100);
  }

  get fatPercentage(): number {
    if (!this.fatTarget || this.fatTarget <= 0) return 0;
    return Math.min(100, (this.fat / this.fatTarget) * 100);
  }

  formatMealTime(date: string | Date): string {
    if (!date) return '';
    const mealDate = new Date(date);
    if (isNaN(mealDate.getTime())) return '';
    return mealDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.meals = [];
    this.calories = 0;
    this.protein = 0;
    this.carbs = 0;
    this.fat = 0;
    this.cdr.detectChanges();

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const today = this.getTodayDate();

    this.http.get<any>(`http://localhost:5000/api/meals?date=${today}`, { headers }).subscribe({
      next: (response: any) => {
        const meals = response.meals || [];
        this.meals = meals;
        this.calories = meals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
        this.protein = Math.round(meals.reduce((sum: number, m: any) => sum + (m.protein || 0), 0) * 10) / 10;
        this.carbs = Math.round(meals.reduce((sum: number, m: any) => sum + (m.carbs || 0), 0) * 10) / 10;
        this.fat = Math.round(meals.reduce((sum: number, m: any) => sum + (m.fat || 0), 0) * 10) / 10;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.errorMessage = error?.error?.message || 'Failed to load your data. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private getTodayDate(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
}