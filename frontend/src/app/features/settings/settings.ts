import {
  Component,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {

  user: any = null;

  saving = false;
  saved = false;
  errorMessage = '';

  firstName = '';
  lastName = '';
  username = '';
  email = '';

  gender = '';
  dateOfBirth = '';

  weight = 0;
  height = 0;

  goal = '';

  // Nutrition profile values
  nutritionGoal = 'maintain_weight';
  activityLevel = 'moderate';


  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}


  // ==========================================
  // LOAD SETTINGS
  // ==========================================

  ngOnInit(): void {

    const token = this.authService.getToken();

    if (!token) {
      this.errorMessage =
        'Please log in again before opening Settings.';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });


    // Get latest User data
    this.http
      .get<any>(
        'http://localhost:5000/api/auth/me',
        { headers }
      )
      .subscribe({

        next: (response) => {

          if (response.success && response.user) {

            this.user = response.user;

            this.firstName =
              response.user.firstName || '';

            this.lastName =
              response.user.lastName || '';

            this.username =
              response.user.username || '';

            this.email =
              response.user.email || '';

            // Always keep gender in backend format
            this.gender =
              (response.user.gender || '').toLowerCase();

            this.dateOfBirth =
              this.formatDateForInput(
                response.user.dateOfBirth
              );

            this.weight =
              Number(response.user.weight) || 0;

            this.height =
              Number(response.user.height) || 0;

            this.goal =
              response.user.goal || '';

          }

          this.loadNutritionProfile(token);
        },

        error: () => {

          this.errorMessage =
            'Failed to load your profile.';

          this.cdr.detectChanges();
        }

      });
  }


  // ==========================================
  // LOAD NUTRITION PROFILE
  // ==========================================

  private loadNutritionProfile(token: string): void {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .get<any>(
        'http://localhost:5000/api/profile',
        { headers }
      )
      .subscribe({

        next: (response) => {

          if (response.success && response.profile) {

            const profile = response.profile;

            this.nutritionGoal =
              profile.goal || 'maintain_weight';

            this.activityLevel =
              profile.activityLevel || 'moderate';

            // Use profile values if available
            this.weight =
              Number(profile.weight) || this.weight;

            this.height =
              Number(profile.height) || this.height;

          }

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Nutrition profile loading error:',
            error
          );

          this.cdr.detectChanges();
        }

      });
  }


  // ==========================================
  // FORMAT DATE
  // ==========================================

  private formatDateForInput(
    date: string | null
  ): string {

    if (!date) {
      return '';
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return '';
    }

    const year =
      parsedDate.getFullYear();

    const month =
      String(
        parsedDate.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        parsedDate.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  // ==========================================
  // DISPLAY NAME
  // ==========================================

  get displayName(): string {
    return this.user?.firstName || 'User';
  }


  // ==========================================
  // SAVE SETTINGS
  // ==========================================

  saveSettings(): void {

    if (this.saving) {
      return;
    }


    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!this.firstName.trim()) {
      this.errorMessage =
        'First name is required.';
      return;
    }

    if (!this.lastName.trim()) {
      this.errorMessage =
        'Last name is required.';
      return;
    }

    // Username validation
    if (!this.username.trim()) {
      this.errorMessage =
        'Username is required.';
      return;
    }

    if (this.username.trim().length < 3) {
      this.errorMessage =
        'Username must be at least 3 characters.';
      return;
    }

    if (this.username.trim().length > 30) {
      this.errorMessage =
        'Username must not exceed 30 characters.';
      return;
    }

    if (!/[A-Za-z]/.test(this.username.trim())) {
      this.errorMessage =
        'Username must contain at least one letter.';
      return;
    }

    if (!this.gender) {
      this.errorMessage =
        'Please select your gender.';
      return;
    }

    if (!this.dateOfBirth) {
      this.errorMessage =
        'Please select your date of birth.';
      return;
    }

    if (
      this.weight < 20 ||
      this.weight > 300
    ) {
      this.errorMessage =
        'Weight must be between 20 and 300 kg.';
      return;
    }

    if (
      this.height < 100 ||
      this.height > 250
    ) {
      this.errorMessage =
        'Height must be between 100 and 250 cm.';
      return;
    }

    if (!this.goal.trim()) {
      this.errorMessage =
        'Please enter your wellness goal.';
      return;
    }


    // ==========================================
    // NORMALIZE VALUES FOR BACKEND
    // ==========================================

    const normalizedGender =
      this.gender.toLowerCase();

    if (
      normalizedGender !== 'male' &&
      normalizedGender !== 'female'
    ) {
      this.errorMessage =
        'Please select a valid gender.';
      return;
    }


    const normalizedUsername =
      this.username.trim().toLowerCase();


    this.saving = true;
    this.saved = false;
    this.errorMessage = '';

    this.cdr.detectChanges();


    const token =
      this.authService.getToken();

    if (!token) {

      this.saving = false;

      this.errorMessage =
        'Please log in again.';

      this.cdr.detectChanges();

      return;
    }


    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });


    // ==========================================
    // DATA SENT TO BACKEND
    // ==========================================

    const updates = {

      firstName:
        this.firstName.trim(),

      lastName:
        this.lastName.trim(),

      username:
        normalizedUsername,

      gender:
        normalizedGender,

      dateOfBirth:
        this.dateOfBirth,

      weight:
        Number(this.weight),

      height:
        Number(this.height),

      goal:
        this.goal.trim(),

      activityLevel:
        this.activityLevel,

      nutritionGoal:
        this.nutritionGoal

    };


    console.log(
      'Settings update:',
      updates
    );


    this.http
      .put<any>(
        'http://localhost:5000/api/profile',
        updates,
        { headers }
      )
      .subscribe({

        next: (response) => {

          const updatedUser = {
            ...this.user,
            ...updates
          };


          if (response.user) {

            Object.assign(
              updatedUser,
              response.user
            );

          }


          this.authService.saveAuth(
            token,
            updatedUser
          );


          this.user =
            updatedUser;


          this.username =
            normalizedUsername;

          this.gender =
            normalizedGender;


          this.saving = false;
          this.saved = true;


          this.cdr.detectChanges();


          setTimeout(() => {

            this.saved = false;

            this.cdr.detectChanges();

          }, 3000);

        },


        error: (error) => {

          console.error(
            'Settings save error:',
            error
          );

          console.error(
            'Backend validation errors:',
            error?.error?.errors
          );


          // Show the actual validation error if backend provides one
          if (
            error?.error?.errors &&
            Array.isArray(error.error.errors) &&
            error.error.errors.length > 0
          ) {

            this.errorMessage =
              error.error.errors.join(' ');

          } else {

            this.errorMessage =
              error?.error?.message ||
              'Failed to save settings.';

          }


          this.saving = false;

          this.cdr.detectChanges();

        }

      });

  }

}