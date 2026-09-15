import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar';
import { timeout, finalize } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  user: any = null;
  profile: any = null;

  loading = true;
  saving = false;

  errorMessage = '';
  successMessage = '';

  editMode = false;

  form = {
    firstName: '',
    lastName: '',
    username: '',
    dateOfBirth: '',
    gender: '',
    height: null as number | null,
    weight: null as number | null,
    activityLevel: 'moderate',
    nutritionGoal: 'maintain_weight',
    goal: ''
  };

  activityLevels = [
    {
      value: 'sedentary',
      label: 'Sedentary'
    },
    {
      value: 'light',
      label: 'Lightly Active'
    },
    {
      value: 'moderate',
      label: 'Moderately Active'
    },
    {
      value: 'active',
      label: 'Active'
    },
    {
      value: 'very_active',
      label: 'Very Active'
    }
  ];

  nutritionGoals = [
    {
      value: 'lose_weight',
      label: 'Lose Weight'
    },
    {
      value: 'maintain_weight',
      label: 'Maintain Weight'
    },
    {
      value: 'gain_weight',
      label: 'Gain Weight'
    }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  loadProfile(): void {

    const token = this.authService.getToken();
    const savedUser = this.authService.getUser();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    if (savedUser) {
      this.user = savedUser;
      this.loading = false;
      this.prepareForm();
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // Get latest user information
    this.http.get<any>(
      'http://localhost:5000/api/auth/me',
      { headers }
    )
    .pipe(
      timeout(8000)
    )
    .subscribe({

      next: (response) => {

        if (response?.user) {

          this.user = response.user;

          this.authService.saveAuth(
            token,
            response.user
          );

          this.prepareForm();
        }

        this.loadNutritionProfile(
          token,
          headers
        );
      },

      error: (error) => {

        console.error(
          'Failed to load user profile:',
          error
        );

        if (!this.user) {

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to load your profile. Please try again.';

          return;
        }

        this.loadNutritionProfile(
          token,
          headers
        );
      }

    });
  }


  // ==========================================
  // LOAD NUTRITION PROFILE
  // ==========================================

  loadNutritionProfile(
    token: string,
    headers: HttpHeaders
  ): void {

    this.http.get<any>(
      'http://localhost:5000/api/profile',
      { headers }
    )
    .pipe(
      timeout(8000)
    )
    .subscribe({

      next: (response) => {

        if (response?.profile) {

          this.profile = response.profile;

          this.prepareForm();
        }

        this.loading = false;
        this.errorMessage = '';
      },

      error: (error) => {

        console.error(
          'Failed to load nutrition profile:',
          error
        );

        /*
         * We can still display the normal
         * user information even if the
         * nutrition profile request fails.
         */

        this.loading = false;

        if (!this.user) {

          this.errorMessage =
            error?.error?.message ||
            'Failed to load your profile. Please try again.';
        }

      }

    });
  }


  // ==========================================
  // PREPARE EDIT FORM
  // ==========================================

  prepareForm(): void {

    if (!this.user) {
      return;
    }

    this.form.firstName =
      this.user.firstName || '';

    this.form.lastName =
      this.user.lastName || '';

    this.form.username =
      this.user.username || '';

    this.form.dateOfBirth =
      this.formatDateForInput(
        this.user.dateOfBirth
      );

    this.form.gender =
      this.user.gender || '';

    this.form.height =
      this.user.height !== undefined &&
      this.user.height !== null
        ? Number(this.user.height)
        : null;

    this.form.weight =
      this.user.weight !== undefined &&
      this.user.weight !== null
        ? Number(this.user.weight)
        : null;

    this.form.goal =
      this.user.goal || '';

    /*
     * Nutrition profile values are preferred
     * for activity and nutrition goal.
     */

    if (this.profile) {

      this.form.activityLevel =
        this.profile.activityLevel ||
        'moderate';

      this.form.nutritionGoal =
        this.profile.goal ||
        'maintain_weight';

      /*
       * Use profile values if user values
       * are not available.
       */

      if (
        this.form.gender === '' &&
        this.profile.gender
      ) {

        this.form.gender =
          this.profile.gender;
      }

      if (
        this.form.height === null &&
        this.profile.height !== undefined
      ) {

        this.form.height =
          Number(this.profile.height);
      }

      if (
        this.form.weight === null &&
        this.profile.weight !== undefined
      ) {

        this.form.weight =
          Number(this.profile.weight);
      }
    }
  }


  // ==========================================
  // ENTER EDIT MODE
  // ==========================================

  startEditing(): void {

    this.successMessage = '';
    this.errorMessage = '';

    this.prepareForm();

    this.editMode = true;
  }


  // ==========================================
  // CANCEL EDIT
  // ==========================================

  cancelEditing(): void {

    if (this.saving) {
      return;
    }

    this.editMode = false;

    this.successMessage = '';
    this.errorMessage = '';

    this.prepareForm();
  }

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  saveProfile(): void {

    if (this.saving) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    // ========================================
    // GET TOKEN
    // ========================================

    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // ========================================
    // VALIDATION
    // ========================================

    if (!this.form.firstName.trim()) {
      this.errorMessage =
        'First name is required.';
      return;
    }

    if (!this.form.lastName.trim()) {
      this.errorMessage =
        'Last name is required.';
      return;
    }

    if (!this.form.username.trim()) {
      this.errorMessage =
        'Username is required.';
      return;
    }

    if (!this.form.dateOfBirth) {
      this.errorMessage =
        'Please enter your date of birth.';
      return;
    }

    if (!this.form.gender) {
      this.errorMessage =
        'Please select your gender.';
      return;
    }

    const height =
      Number(this.form.height);

    const weight =
      Number(this.form.weight);

    if (
      !Number.isFinite(height) ||
      height < 50 ||
      height > 250
    ) {
      this.errorMessage =
        'Height must be between 50 and 250 cm.';
      return;
    }

    if (
      !Number.isFinite(weight) ||
      weight < 20 ||
      weight > 300
    ) {
      this.errorMessage =
        'Weight must be between 20 and 300 kg.';
      return;
    }

    if (!this.form.activityLevel) {
      this.errorMessage =
        'Please select your activity level.';
      return;
    }

    if (!this.form.nutritionGoal) {
      this.errorMessage =
        'Please select your nutrition goal.';
      return;
    }

    // ========================================
    // AGE
    // ========================================

    const age =
      Number(
        this.profile?.age ??
        this.user?.age
      );

    if (
      !Number.isFinite(age) ||
      age < 13 ||
      age > 120
    ) {
      this.errorMessage =
        'A valid age is required.';
      return;
    }

    // ========================================
    // REQUEST BODY
    // ========================================

    const data = {

      age,

      gender:
        this.form.gender,

      height,

      weight,

      activityLevel:
        this.form.activityLevel,

      nutritionGoal:
        this.form.nutritionGoal,

      firstName:
        this.form.firstName.trim(),

      lastName:
        this.form.lastName.trim(),

      username:
        this.form.username.trim(),

      dateOfBirth:
        this.form.dateOfBirth,

      goal:
        this.form.goal.trim()
    };

    console.log(
      '📤 UPDATE PROFILE:',
      data
    );

    // ========================================
    // START SAVING
    // ========================================

    this.saving = true;

    const headers =
      new HttpHeaders({
        Authorization:
          `Bearer ${token}`,

        'Content-Type':
          'application/json'
      });

    // ========================================
    // PUT REQUEST
    // ========================================

    this.http.put<any>(
      'http://localhost:5000/api/profile',
      data,
      {
        headers
      }
    )
    .subscribe({

      // ======================================
      // SUCCESS
      // ======================================

      next: (response) => {
console.log('✅ PROFILE UPDATED:', response);

// ====================================
// UPDATE UI IMMEDIATELY
// ====================================

this.saving = false;
this.editMode = false;
this.errorMessage = '';
this.successMessage = 'Profile updated successfully!';

// Force Angular to refresh the screen
this.cdr.detectChanges();

// Scroll automatically to the top
window.scrollTo({
  top: 0,
  behavior: 'smooth'
});


// ====================================
        // UPDATE USER
        // ====================================

        if (response?.user) {

          this.user =
            response.user;

          /*
           * Saving to localStorage must NOT
           * be allowed to break the successful
           * profile update.
           */

          try {

            this.authService.saveAuth(
              token,
              response.user
            );

          } catch (storageError) {

            console.warn(
              'Profile saved, but local auth storage could not be updated:',
              storageError
            );

          }

        } else {

          /*
           * Fallback local user update.
           */

          this.user = {
            ...this.user,

            firstName:
              data.firstName,

            lastName:
              data.lastName,

            username:
              data.username,

            dateOfBirth:
              data.dateOfBirth,

            gender:
              data.gender,

            height:
              data.height,

            weight:
              data.weight,

            goal:
              data.goal
          };

          try {

            this.authService.saveAuth(
              token,
              this.user
            );

          } catch (storageError) {

            console.warn(
              'Profile saved, but local auth storage could not be updated:',
              storageError
            );

          }

        }

        // ====================================
        // UPDATE NUTRITION PROFILE
        // ====================================

        if (response?.profile) {

          this.profile =
            response.profile;

        } else {

          this.profile = {
            ...this.profile,

            age:
              data.age,

            gender:
              data.gender,

            height:
              data.height,

            weight:
              data.weight,

            activityLevel:
              data.activityLevel,

            goal:
              data.nutritionGoal
          };

        }

        // ====================================
        // KEEP SUCCESS MESSAGE
        // ====================================

        this.successMessage =
          'Profile updated successfully!';

        /*
         * Keep the green message visible for
         * 4 seconds, just like Settings.
         */

        setTimeout(() => {

          this.successMessage = '';

        }, 4000);

      },

      // ======================================
      // ERROR
      // ======================================

      error: (error) => {

        console.error(
          '❌ PROFILE UPDATE FAILED:',
          error
        );

        console.error(
          '❌ STATUS:',
          error?.status
        );

        console.error(
          '❌ SERVER RESPONSE:',
          error?.error
        );

        this.saving = false;

        this.successMessage = '';

        if (
          error?.status === 400
        ) {

          const validationErrors =
            error?.error?.errors;

          if (
            Array.isArray(validationErrors) &&
            validationErrors.length > 0
          ) {

            this.errorMessage =
              validationErrors
                .map(
                  (item: any) =>
                    item.message || item
                )
                .join(' ');

          } else {

            this.errorMessage =
              error?.error?.message ||
              'Invalid profile information.';
          }

          return;
        }

        if (
          error?.status === 401
        ) {

          this.errorMessage =
            'Your session has expired. Please log in again.';

          return;
        }

        if (
          error?.status === 404
        ) {

          this.errorMessage =
            error?.error?.message ||
            'Profile not found.';

          return;
        }

        if (
          error?.status === 409
        ) {

          this.errorMessage =
            error?.error?.message ||
            'This username is already in use.';

          return;
        }

        this.errorMessage =
          error?.error?.message ||
          'Failed to update your profile. Please try again.';
      }

    });

  }


  // ==========================================
  // HELPERS
  // ==========================================

  get fullName(): string {

    if (!this.user) {
      return 'User';
    }

    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
  }


  get initials(): string {

    if (!this.user) {
      return 'U';
    }

    const first =
      this.user.firstName?.charAt(0) || '';

    const last =
      this.user.lastName?.charAt(0) || '';

    return `${first}${last}`.toUpperCase();
  }


  get profileImage(): string {

    if (!this.user?.imageUrl) {
      return '/assets/default-user.png';
    }

    if (
      this.user.imageUrl.startsWith('http://') ||
      this.user.imageUrl.startsWith('https://')
    ) {

      return this.user.imageUrl;

    }

    return `http://localhost:5000${this.user.imageUrl}`;
  }


  onImageError(event: Event): void {

    const image =
      event.target as HTMLImageElement;

    image.src =
      '/assets/default-user.png';
  }


  get formattedDateOfBirth(): string {

    if (!this.user?.dateOfBirth) {
      return 'Not provided';
    }

    const date =
      new Date(this.user.dateOfBirth);

    if (isNaN(date.getTime())) {
      return 'Not provided';
    }

    return date.toLocaleDateString(
      'en-US',
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }
    );
  }


  // ==========================================
  // MEMBER SINCE
  // ==========================================

  get formattedCreatedAt(): string {

    if (!this.user?.createdAt) {
      return 'Not available';
    }

    const date =
      new Date(this.user.createdAt);

    if (isNaN(date.getTime())) {
      return 'Not available';
    }

    return date.toLocaleDateString(
      'en-US',
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }
    );
  }


  get activityLevelLabel(): string {

    const found =
      this.activityLevels.find(
        item =>
          item.value ===
          this.form.activityLevel
      );

    return found?.label ||
      this.form.activityLevel;
  }


  get nutritionGoalLabel(): string {

    const found =
      this.nutritionGoals.find(
        item =>
          item.value ===
          this.form.nutritionGoal
      );

    return found?.label ||
      this.form.nutritionGoal;
  }


  formatDateForInput(
    value: string | undefined
  ): string {

    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (isNaN(date.getTime())) {
      return '';
    }

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


  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

}