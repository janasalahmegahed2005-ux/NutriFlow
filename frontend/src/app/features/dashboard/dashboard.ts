import {
  Component,
  OnInit,
  ChangeDetectorRef,
  signal,
  computed
} from '@angular/core';

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

  // ================================
  // NUTRITION DATA - SIGNALS
  // ================================

  calories = signal(0);
  calorieTarget = 2000;

  protein = signal(0);
  proteinTarget = 120;

  carbs = signal(0);
  carbsTarget = 250;

  fat = signal(0);
  fatTarget = 65;

  // ================================
  // WATER - SIGNAL
  // ================================

  waterConsumed = signal(0);
  waterTarget = 2500;

  // ================================
  // MEALS
  // ================================

meals = signal<any[]>([]);
  // ================================
  // UI STATE - SIGNALS
  // ================================

  loading = signal(false);
  errorMessage = signal('');

  // ================================
  // NOTIFICATIONS - SIGNALS
  // ================================

  notificationsOpen = signal(false);
  hasUnreadNotifications = signal(true);

  notifications = [
    {
      title: 'Welcome to NutriFlow',
      message: 'Start your day by logging your first meal.',
      icon: '🌿'
    },
    {
      title: 'Stay hydrated',
      message: 'Remember to keep tracking your water intake.',
      icon: '💧'
    },
    {
      title: 'Keep going!',
      message: 'Small choices create big changes.',
      icon: '✨'
    }
  ];

  // ================================
  // COMPUTED SIGNALS
  // ================================

  caloriePercentage = computed(() => {

    if (!this.calorieTarget || this.calorieTarget <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (this.calories() / this.calorieTarget) * 100
      )
    );
  });

  caloriesRemaining = computed(() => {

    return Math.max(
      0,
      this.calorieTarget - this.calories()
    );
  });

  proteinPercentage = computed(() => {

    if (!this.proteinTarget || this.proteinTarget <= 0) {
      return 0;
    }

    return Math.min(
      100,
      (this.protein() / this.proteinTarget) * 100
    );
  });

  carbsPercentage = computed(() => {

    if (!this.carbsTarget || this.carbsTarget <= 0) {
      return 0;
    }

    return Math.min(
      100,
      (this.carbs() / this.carbsTarget) * 100
    );
  });

  fatPercentage = computed(() => {

    if (!this.fatTarget || this.fatTarget <= 0) {
      return 0;
    }

    return Math.min(
      100,
      (this.fat() / this.fatTarget) * 100
    );
  });

  waterPercentage = computed(() => {

    if (!this.waterTarget || this.waterTarget <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (this.waterConsumed() / this.waterTarget) * 100
      )
    );
  });

  waterRemaining = computed(() => {

    return Math.max(
      0,
      this.waterTarget - this.waterConsumed()
    );
  });

  waterLiters = computed(() => {

    return Math.round(
      (this.waterConsumed() / 1000) * 10
    ) / 10;
  });

  waterTargetLiters = computed(() => {

    return this.waterTarget / 1000;
  });

  waterRemainingLiters = computed(() => {

    return Math.round(
      (this.waterRemaining() / 1000) * 10
    ) / 10;
  });

  // ================================
  // CONSTRUCTOR
  // ================================

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {

    this.user = this.authService.getUser();

    this.calorieTarget =
      this.user?.calorieTarget || 2000;

    this.proteinTarget =
      this.user?.proteinTarget || 120;

    this.carbsTarget =
      this.user?.carbsTarget || 250;

    this.fatTarget =
      this.user?.fatTarget || 65;
  }

  // ================================
  // INIT
  // ================================

  ngOnInit(): void {

    this.loadDashboardData();

  }

  // ================================
  // USER INFORMATION
  // ================================

  get firstName(): string {

    return this.user?.firstName || 'User';

  }

  get fullName(): string {

    if (!this.user) {
      return 'User';
    }

    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();

  }

  get greeting(): string {

    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good morning';
    }

    if (hour < 18) {
      return 'Good afternoon';
    }

    return 'Good evening';

  }

  get formattedDate(): string {

    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

  }

  // ================================
  // MEAL TIME
  // ================================

  formatMealTime(date: string | Date): string {

    if (!date) {
      return '';
    }

    const mealDate = new Date(date);

    if (isNaN(mealDate.getTime())) {
      return '';
    }

    return mealDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });

  }

  // ================================
  // IMAGE ERROR
  // ================================

  onImageError(event: Event): void {

    const img = event.target as HTMLImageElement;

    img.style.display = 'none';

  }

  // ================================
  // NOTIFICATIONS
  // ================================

  toggleNotifications(): void {

    this.notificationsOpen.update(
      value => !value
    );

    if (this.notificationsOpen()) {

      this.hasUnreadNotifications.set(false);

    }

  }

  // ================================
  // LOAD DASHBOARD DATA
  // ================================

  loadDashboardData(): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.meals.set([]);

    this.calories.set(0);
    this.protein.set(0);
    this.carbs.set(0);
    this.fat.set(0);

    // Always reset water before loading
    // today's actual water entries.
    this.waterConsumed.set(0);

    this.cdr.detectChanges();

    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const today = this.getTodayDate();

    // ================================
    // LOAD TODAY'S MEALS
    // ================================

    this.http
      .get<any>(
        `http://localhost:5000/api/meals?date=${today}`,
        { headers }
      )
      .subscribe({

        next: (response: any) => {

          const meals = response?.meals || [];

        this.meals.set(meals);
          // Calculate total calories
          const totalCalories = meals.reduce(
            (sum: number, m: any) =>
              sum + (Number(m.calories) || 0),
            0
          );

          this.calories.set(totalCalories);

          // Calculate protein
          const totalProtein =
            Math.round(
              meals.reduce(
                (sum: number, m: any) =>
                  sum + (Number(m.protein) || 0),
                0
              ) * 10
            ) / 10;

          this.protein.set(totalProtein);

          // Calculate carbs
          const totalCarbs =
            Math.round(
              meals.reduce(
                (sum: number, m: any) =>
                  sum + (Number(m.carbs) || 0),
                  0
              ) * 10
            ) / 10;

          this.carbs.set(totalCarbs);

          // Calculate fat
          const totalFat =
            Math.round(
              meals.reduce(
                (sum: number, m: any) =>
                  sum + (Number(m.fat) || 0),
                0
              ) * 10
            ) / 10;

          this.fat.set(totalFat);

          this.loading.set(false);

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          console.error(
            'Load meals error:',
            error
          );

          this.errorMessage.set(
            error?.error?.message ||
            'Failed to load your data. Please try again.'
          );

          this.loading.set(false);

          this.cdr.detectChanges();

        }

      });

    // ================================
    // LOAD TODAY'S WATER
    // ================================

    this.http
      .get<any>(
        `http://localhost:5000/api/water/today`,
        { headers }
      )
      .subscribe({

        next: (response: any) => {

          // Backend returns the total water
          // logged by this user today.

          const totalWater =
            Number(response?.totalWater) || 0;

          this.waterConsumed.set(totalWater);

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          console.error(
            'Load water error:',
            error
          );

          // Never display fake/default water
          // if the request fails.

          this.waterConsumed.set(0);

          this.cdr.detectChanges();

        }

      });

  }

  // ================================
  // TODAY'S DATE
  // ================================

  private getTodayDate(): string {

    const today = new Date();

    return `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;

  }

}
