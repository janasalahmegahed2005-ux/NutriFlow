import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { AuthService } from '../../services/auth.service';

import { SidebarComponent } from '../../shared/sidebar';

import {
  timeout
} from 'rxjs';


@Component({
  selector: 'app-profile',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent
  ],

  templateUrl: './profile.html',
  styleUrl: './profile.css'
})


export class Profile implements OnInit {

  // ==========================================
  // USER / PROFILE DATA
  // ==========================================

  user: any = null;

  profile: any = null;


  // ==========================================
  // PAGE STATE
  // ==========================================

  loading = true;

  saving = false;

  errorMessage = '';

  successMessage = '';

  editMode = false;

  selectedProfileImage: File | null = null;
profileImagePreview: string | null = null;
removeProfileImage = false;

  // ==========================================
  // REACTIVE FORM
  // ==========================================

  profileForm = new FormGroup({

    firstName: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    lastName: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    username: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    dateOfBirth: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    gender: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    height: new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required,
          Validators.min(50),
          Validators.max(250)
        ]
      }
    ),

    weight: new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required,
          Validators.min(20),
          Validators.max(300)
        ]
      }
    ),

    activityLevel: new FormControl(
      'moderate',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    nutritionGoal: new FormControl(
      'maintain_weight',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    // IMPORTANT:
    // This is the user's personal
    // Wellness Goal.
    goal: new FormControl(
      '',
      {
        nonNullable: true
      }
    )

  });


  // ==========================================
  // ACTIVITY LEVELS
  // ==========================================

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


  // ==========================================
  // NUTRITION GOALS
  // ==========================================

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


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    this.loadProfile();

  }


  // ==========================================
  // LOAD PROFILE
  // ==========================================

  loadProfile(): void {

    const token =
      this.authService.getToken();

    const savedUser =
      this.authService.getUser();

      


    // ========================================
    // NO TOKEN
    // ========================================

    if (!token) {

      this.router.navigate([
        '/login'
      ]);

      return;

    }


    // ========================================
    // USE SAVED USER IMMEDIATELY
    // ========================================

    if (savedUser) {

      this.user = savedUser;

      this.loading = false;

      this.prepareForm();

    }


    // ========================================
    // AUTHORIZATION HEADER
    // ========================================

    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`

      });


    // ========================================
    // GET LATEST USER INFORMATION
    // ========================================

    this.http
      .get<any>(
        'http://localhost:5000/api/auth/me',
        { headers }
      )

      .pipe(
        timeout(8000)
      )

      .subscribe({

        next: (response) => {

          if (response?.user) {

            this.user =
              response.user;


            // Keep local authentication
            // information updated.

            this.authService.saveAuth(
              token,
              response.user
            );


            this.prepareForm();

          }


          // Load nutrition information
          // after getting the user.

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


          /*
           * If we don't already have a
           * saved user, show the error.
           *
           * If we do have one, continue
           * using it and load nutrition data.
           */

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

    this.http
      .get<any>(
        'http://localhost:5000/api/profile',
        { headers }
      )

      .pipe(
        timeout(8000)
      )

      .subscribe({

        next: (response) => {

          if (response?.profile) {

            this.profile =
              response.profile;


            /*
             * Update the Reactive Form
             * with the nutrition profile data.
             */

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
  // PREPARE REACTIVE FORM
  // ==========================================

  prepareForm(): void {

    if (!this.user) {

      return;

    }


    // ========================================
    // USER VALUES
    // ========================================

    const firstName =
      this.user.firstName || '';

    const lastName =
      this.user.lastName || '';

    const username =
      this.user.username || '';

    const dateOfBirth =
      this.formatDateForInput(
        this.user.dateOfBirth
      );

    const gender =
      this.user.gender || '';


    // ========================================
    // HEIGHT
    // ========================================

    const height =
      this.user.height !== undefined &&
      this.user.height !== null

        ? Number(this.user.height)

        : null;


    // ========================================
    // WEIGHT
    // ========================================

    const weight =
      this.user.weight !== undefined &&
      this.user.weight !== null

        ? Number(this.user.weight)

        : null;


    // ========================================
    // WELLNESS GOAL
    // ========================================

    const goal =
      this.user.goal || '';


    // ========================================
    // DEFAULT NUTRITION VALUES
    // ========================================

    let activityLevel =
      'moderate';

    let nutritionGoal =
      'maintain_weight';


    // ========================================
    // USE NUTRITION PROFILE VALUES
    // ========================================

    if (this.profile) {

      activityLevel =
        this.profile.activityLevel ||
        'moderate';

      nutritionGoal =
        this.profile.goal ||
        'maintain_weight';


      /*
       * Use profile values only when
       * user values are not available.
       */

      const finalGender =
        gender === '' &&
        this.profile.gender

          ? this.profile.gender

          : gender;


      const finalHeight =
        height === null &&
        this.profile.height !== undefined

          ? Number(this.profile.height)

          : height;


      const finalWeight =
        weight === null &&
        this.profile.weight !== undefined

          ? Number(this.profile.weight)

          : weight;


      // ====================================
      // PATCH FORM
      // ====================================

      this.profileForm.patchValue({

        firstName,

        lastName,

        username,

        dateOfBirth,

        gender: finalGender,

        height: finalHeight,

        weight: finalWeight,

        activityLevel,

        nutritionGoal,

        goal

      });

      return;

    }


    // ========================================
    // PATCH FORM WITHOUT PROFILE
    // ========================================

    this.profileForm.patchValue({

      firstName,

      lastName,

      username,

      dateOfBirth,

      gender,

      height,

      weight,

      activityLevel,

      nutritionGoal,

      goal

    });

  }


  // ==========================================
  // ENTER EDIT MODE
  // ==========================================

  startEditing(): void {

    this.successMessage = '';

    this.errorMessage = '';


    /*
     * Make sure the form contains the
     * latest profile information.
     */

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


    /*
     * Restore original values.
     */

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

    const token =
      this.authService.getToken();


    if (!token) {

      this.router.navigate([
        '/login'
      ]);

      return;

    }


    // ========================================
    // REACTIVE FORM VALIDATION
    // ========================================

    if (
      this.profileForm.invalid
    ) {

      /*
       * Mark every control as touched so
       * Angular knows the user interacted
       * with the invalid form.
       */

      this.profileForm.markAllAsTouched();


      const firstName =
        this.profileForm.controls.firstName;

      const lastName =
        this.profileForm.controls.lastName;

      const username =
        this.profileForm.controls.username;

      const dateOfBirth =
        this.profileForm.controls.dateOfBirth;

      const gender =
        this.profileForm.controls.gender;

      const height =
        this.profileForm.controls.height;

      const weight =
        this.profileForm.controls.weight;

      const activityLevel =
        this.profileForm.controls.activityLevel;

      const nutritionGoal =
        this.profileForm.controls.nutritionGoal;


      if (firstName.invalid) {

        this.errorMessage =
          'First name is required.';

        return;

      }


      if (lastName.invalid) {

        this.errorMessage =
          'Last name is required.';

        return;

      }


      if (username.invalid) {

        this.errorMessage =
          'Username is required.';

        return;

      }


      if (dateOfBirth.invalid) {

        this.errorMessage =
          'Please enter your date of birth.';

        return;

      }


      if (gender.invalid) {

        this.errorMessage =
          'Please select your gender.';

        return;

      }


      if (
        height.hasError('required') ||
        height.hasError('min') ||
        height.hasError('max')
      ) {

        this.errorMessage =
          'Height must be between 50 and 250 cm.';

        return;

      }


      if (
        weight.hasError('required') ||
        weight.hasError('min') ||
        weight.hasError('max')
      ) {

        this.errorMessage =
          'Weight must be between 20 and 300 kg.';

        return;

      }


      if (activityLevel.invalid) {

        this.errorMessage =
          'Please select your activity level.';

        return;

      }


      if (nutritionGoal.invalid) {

        this.errorMessage =
          'Please select your nutrition goal.';

        return;

      }


      this.errorMessage =
        'Please check your profile information.';

      return;

    }


    // ========================================
    // GET REACTIVE FORM VALUES
    // ========================================

    const formValue =
      this.profileForm.getRawValue();


    // ========================================
    // HEIGHT
    // ========================================

    const height =
      Number(formValue.height);


    // ========================================
    // WEIGHT
    // ========================================

    const weight =
      Number(formValue.weight);


    // ========================================
    // AGE
    // ========================================

    let age =
      Number(
        this.profile?.age ??
        this.user?.age
      );

    // If age is not stored, calculate it from date of birth.
    if (
      !Number.isFinite(age) ||
      age < 13 ||
      age > 120
    ) {
      const birthDate =
        new Date(formValue.dateOfBirth);

      if (!isNaN(birthDate.getTime())) {
        const today = new Date();

        age =
          today.getFullYear() -
          birthDate.getFullYear();

        const monthDifference =
          today.getMonth() -
          birthDate.getMonth();

        if (
          monthDifference < 0 ||
          (monthDifference === 0 &&
            today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
      }
    }


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

    // Keep a plain object for the local fallback update.
    const data = {
      age,
      gender: formValue.gender,
      height,
      weight,
      activityLevel: formValue.activityLevel,
      nutritionGoal: formValue.nutritionGoal,
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      username: formValue.username.trim(),
      dateOfBirth: formValue.dateOfBirth,
      goal: formValue.goal.trim()
    };

    const formData = new FormData();

    formData.append('age', String(age));
    formData.append('gender', formValue.gender);
    formData.append('height', String(height));
    formData.append('weight', String(weight));
    formData.append('activityLevel', formValue.activityLevel);
    formData.append('nutritionGoal', formValue.nutritionGoal);
    formData.append('firstName', formValue.firstName.trim());
    formData.append('lastName', formValue.lastName.trim());
    formData.append('username', formValue.username.trim());
    formData.append('dateOfBirth', formValue.dateOfBirth);

    /*
     * goal = Wellness Goal
     * nutritionGoal = Nutrition Goal
     * They remain separate.
     */
    formData.append('goal', formValue.goal.trim());

    // Profile image
    if (this.selectedProfileImage) {
      formData.append(
        'profileImage',
        this.selectedProfileImage,
        this.selectedProfileImage.name
      );
    }

    // Tell backend to replace the image with the default image.
    if (this.removeProfileImage && !this.selectedProfileImage) {
      formData.append('removeProfileImage', 'true');
    }

    console.log('📤 UPDATE PROFILE WITH IMAGE:', {
      age,
      gender: formValue.gender,
      height,
      weight,
      activityLevel: formValue.activityLevel,
      nutritionGoal: formValue.nutritionGoal,
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      username: formValue.username.trim(),
      dateOfBirth: formValue.dateOfBirth,
      goal: formValue.goal.trim(),
      profileImage: this.selectedProfileImage?.name || 'none',
      removeProfileImage: this.removeProfileImage
    });


    // ========================================
    // START SAVING
    // ========================================

    this.saving = true;


    const headers =
      new HttpHeaders({
        Authorization:
          `Bearer ${token}`
      });

    // IMPORTANT: DO NOT set Content-Type here.
    // Browser must create the multipart/form-data boundary.


    // ========================================
    // PUT REQUEST
    // ========================================

    this.http
      .put<any>(
        'http://localhost:5000/api/profile',
        formData,
        {
          headers
        }
      )

      .subscribe({

        // ====================================
        // SUCCESS
        // ====================================

        next: (response) => {

          console.log(
            '✅ PROFILE UPDATED:',
            response
          );


          // ==================================
          // UPDATE UI IMMEDIATELY
          // ==================================

          this.saving = false;

          this.editMode = false;

          this.errorMessage = '';

          this.successMessage =
            'Profile updated successfully!';


          // Force Angular to refresh.

          this.cdr.detectChanges();


          // Scroll to the top.

          window.scrollTo({

            top: 0,

            behavior: 'smooth'

          });


          // ==================================
          // UPDATE USER
          // ==================================

          if (response?.user) {

            this.user =
              response.user;


            /*
             * Saving to localStorage must NOT
             * be allowed to break a successful
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


          // ==================================
          // UPDATE NUTRITION PROFILE
          // ==================================

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

              /*
               * Nutrition Goal only.
               *
               * Do NOT put data.goal here.
               */

              goal:
                data.nutritionGoal

            };

          }


          // ==================================
          // REFRESH REACTIVE FORM
          // ==================================

          this.prepareForm();


          // ==================================
          // SUCCESS MESSAGE
          // ==================================

          setTimeout(() => {

            this.successMessage = '';

          }, 4000);

        },


        // ====================================
        // ERROR
        // ====================================

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


          // ==================================
          // 400
          // ==================================

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
                      item?.message ||
                      item
                  )

                  .join(' ');

            } else {

              this.errorMessage =
                error?.error?.message ||
                'Invalid profile information.';

            }


            return;

          }


          // ==================================
          // 401
          // ==================================

          if (
            error?.status === 401
          ) {

            this.errorMessage =
              'Your session has expired. Please log in again.';

            return;

          }


          // ==================================
          // 404
          // ==================================

          if (
            error?.status === 404
          ) {

            this.errorMessage =
              error?.error?.message ||
              'Profile not found.';

            return;

          }


          // ==================================
          // 409
          // ==================================

          if (
            error?.status === 409
          ) {

            this.errorMessage =
              error?.error?.message ||
              'This username is already in use.';

            return;

          }


          // ==================================
          // OTHER ERRORS
          // ==================================

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


  // ==========================================
  // INITIALS
  // ==========================================

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


  // ==========================================
  // PROFILE IMAGE
  // ==========================================

  get profileImage(): string {
    // Show newly selected image immediately.
    if (this.profileImagePreview) {
      return this.profileImagePreview;
    }

    // Show frontend default after Remove Photo.
    if (this.removeProfileImage) {
      return '/assets/default-user.png';
    }

    if (!this.user?.imageUrl) {
      return '/assets/default-user.png';
    }

    // The backend default file is not required in the browser.
    if (
      this.user.imageUrl ===
      '/uploads/users/default-user.png'
    ) {
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


  // ==========================================
  // SELECT PROFILE IMAGE
  // ==========================================

  onProfileImageSelected(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage =
        'Only JPG, PNG, and WEBP images are allowed.';
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage =
        'Image size must be less than 5 MB.';
      input.value = '';
      return;
    }

    this.selectedProfileImage = file;
    this.removeProfileImage = false;
    this.errorMessage = '';

    if (this.profileImagePreview) {
      URL.revokeObjectURL(this.profileImagePreview);
    }

    this.profileImagePreview =
      URL.createObjectURL(file);

    this.cdr.detectChanges();

    console.log(
      '🖼️ Selected profile image:',
      file.name
    );
  }


  // ==========================================
  // REMOVE PROFILE IMAGE
  // ==========================================

  removeSelectedProfileImage(): void {
    if (this.profileImagePreview) {
      URL.revokeObjectURL(this.profileImagePreview);
    }

    this.selectedProfileImage = null;
    this.profileImagePreview = null;
    this.removeProfileImage = true;
    this.errorMessage = '';

    this.cdr.detectChanges();

    console.log('🗑️ Profile image marked for removal');
  }


  // ==========================================
  // IMAGE ERROR
  // ==========================================

  onImageError(
    event: Event
  ): void {

    const image =
      event.target as HTMLImageElement;

    if (image) {
      image.src =
        '/assets/default-user.png';
    }
  }


  // ==========================================
  // FORMATTED DATE OF BIRTH
  // ==========================================

  get formattedDateOfBirth(): string {

    if (!this.user?.dateOfBirth) {

      return 'Not provided';

    }


    const date =
      new Date(
        this.user.dateOfBirth
      );


    if (
      isNaN(
        date.getTime()
      )
    ) {

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
      new Date(
        this.user.createdAt
      );


    if (
      isNaN(
        date.getTime()
      )
    ) {

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


  // ==========================================
  // ACTIVITY LEVEL LABEL
  // ==========================================

  get activityLevelLabel(): string {

    const currentActivityLevel =
      this.profile?.activityLevel ||
      this.profileForm.controls.activityLevel.value;


    const found =
      this.activityLevels.find(
        item =>
          item.value ===
          currentActivityLevel
      );


    return (
      found?.label ||
      currentActivityLevel ||
      'Not provided'
    );

  }


  // ==========================================
  // NUTRITION GOAL LABEL
  // ==========================================

  get nutritionGoalLabel(): string {

    const currentNutritionGoal =
      this.profile?.goal ||
      this.profileForm.controls.nutritionGoal.value;


    const found =
      this.nutritionGoals.find(
        item =>
          item.value ===
          currentNutritionGoal
      );


    return (
      found?.label ||
      currentNutritionGoal ||
      'Not provided'
    );

  }


  // ==========================================
  // DATE FOR INPUT
  // ==========================================

  formatDateForInput(
    value: string | undefined
  ): string {

    if (!value) {

      return '';

    }


    const date =
      new Date(value);


    if (
      isNaN(
        date.getTime()
      )
    ) {

      return '';

    }


    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      );


    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );


    return `${year}-${month}-${day}`;

  }


  // ==========================================
  // GO TO DASHBOARD
  // ==========================================

  goToDashboard(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }

} 
