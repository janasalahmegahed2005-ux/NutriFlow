import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  firstName: string = '';
  lastName: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  dateOfBirth: string = '';
  gender: string = '';
  weight: string = '';
  height: string = '';
  goal: string = '';

  selectedImage: File | null = null;

  imagePreview: string =
    '/assets/default-user.png';

  // ==========================================
  // PASSWORD VISIBILITY
  // ==========================================
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ==========================================
  // TOGGLE PASSWORD
  // ==========================================
  togglePassword(): void {
    this.showPassword =
      !this.showPassword;
  }

  // ==========================================
  // TOGGLE CONFIRM PASSWORD
  // ==========================================
  toggleConfirmPassword(): void {
    this.showConfirmPassword =
      !this.showConfirmPassword;
  }

  // ==========================================
  // PROFILE IMAGE
  // ==========================================
  onImageSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const file =
      input.files[0];

    if (
      !file.type.startsWith('image/')
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Image',
        text: 'Please select an image file.',
        confirmButtonText: 'OK'
      });

      return;
    }

    this.selectedImage = file;

    const reader =
      new FileReader();

    reader.onload = () => {
      this.imagePreview =
        reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  // ==========================================
  // REGISTER
  // ==========================================
  onRegister(event: Event): void {

    console.log(
      'CREATE ACCOUNT BUTTON CLICKED'
    );

    // ==========================================
    // FIRST NAME
    // ==========================================
    if (!this.firstName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter your first name.',
        confirmButtonText: 'OK'
      });

      return;
    }

    // ==========================================
    // LAST NAME
    // ==========================================
    if (!this.lastName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter your last name.',
        confirmButtonText: 'OK'
      });

      return;
    }

    // ==========================================
    // USERNAME
    // ==========================================
    const cleanUsername =
      this.username.trim();

    if (!cleanUsername) {
      Swal.fire({
        icon: 'warning',
        title: 'Username Required',
        text: 'Please choose a username.',
        confirmButtonText: 'OK'
      });

      return;
    }

    if (cleanUsername.length < 3) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Username',
        text: 'Username must be at least 3 characters long.',
        confirmButtonText: 'OK'
      });

      return;
    }

    if (cleanUsername.length > 30) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Username',
        text: 'Username cannot be longer than 30 characters.',
        confirmButtonText: 'OK'
      });

      return;
    }

    // Username must contain at least one letter.
    // Numbers and symbols are allowed.
    // Spaces are allowed.
    if (!/[A-Za-z]/.test(cleanUsername)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Username',
        text: 'Username must contain at least one letter.',
        confirmButtonText: 'OK'
      });

      return;
    }

    // ==========================================
    // EMAIL
    // ==========================================
    const cleanEmail =
      this.email.trim();

    if (!cleanEmail) {
      Swal.fire({
        icon: 'warning',
        title: 'Email Required',
        text: 'Please enter your email.',
        confirmButtonText: 'OK'
      });

      return;
    }

    // ==========================================
    // GENDER
    // ==========================================
    if (!this.gender) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select your gender.',
        confirmButtonText: 'OK'
      });

      return;
    }

    // ==========================================
    // DATE OF BIRTH
    // ==========================================
    if (!this.dateOfBirth) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter your date of birth.',
        confirmButtonText: 'OK'
      });

      return;
    }

    // ==========================================
    // WEIGHT
    // ==========================================
    if (
      !this.weight ||
      Number(this.weight) <= 0
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Weight',
        text: 'Please enter your weight.',
        confirmButtonText: 'OK'
      });

      return;
    }

    // ==========================================
    // HEIGHT
    // ==========================================
    if (
      !this.height ||
      Number(this.height) <= 0
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Height',
        text: 'Please enter your height.',
        confirmButtonText: 'OK'
      });

      return;
    }

    // ==========================================
    // GOAL
    // ==========================================
    if (!this.goal.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please describe your wellness goal.',
        confirmButtonText: 'OK'
      });

      return;
    }

    // ==========================================
    // PASSWORD
    // ==========================================
    if (!this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Required',
        text: 'Please create a password.',
        confirmButtonText: 'OK'
      });

      return;
    }

    // ==========================================
    // CONFIRM PASSWORD
    // ==========================================
    if (
      this.password !==
      this.confirmPassword
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Passwords Do Not Match',
        text: 'Please make sure both passwords are the same.',
        confirmButtonText: 'Try Again'
      });

      return;
    }

    // ==========================================
    // GET FORM
    // ==========================================
    const form =
      event.target as HTMLFormElement;

    const formData =
      new FormData(form);

    // ==========================================
    // MAKE SURE USERNAME IS INCLUDED
    // ==========================================
    formData.set(
      'username',
      cleanUsername
    );

    // ==========================================
    // MAKE SURE EMAIL IS INCLUDED
    // ==========================================
    formData.set(
      'email',
      cleanEmail
    );

    // ==========================================
    // FAMILY NAME → LAST NAME
    // ==========================================
    const familyName =
      formData.get('familyName');

    formData.delete(
      'familyName'
    );

    if (familyName !== null) {

      formData.append(
        'lastName',
        familyName as string
      );
    }

    // ==========================================
    // REMOVE CONFIRM PASSWORD
    // Backend doesn't need it
    // ==========================================
    formData.delete(
      'confirmPassword'
    );

    // ==========================================
    // SEND REQUEST
    // ==========================================
    console.log(
      'Sending registration request...'
    );

    this.http.post(
      'http://localhost:5000/api/auth/register',
      formData
    ).subscribe({

      next: (response) => {

        console.log(
          'Registration successful:',
          response
        );

        Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          text: 'Your account has been created successfully.',
          confirmButtonText: 'Continue'
        }).then(() => {

          this.router.navigate([
            '/login'
          ]);

        });
      },

      error: (error) => {

        console.error(
          'Registration failed:',
          error
        );

        // ==========================================
        // PASSWORD SECURITY ERRORS
        // ==========================================
        if (
          error?.error?.errors &&
          Array.isArray(error.error.errors) &&
          error.error.errors.length > 0
        ) {

          const passwordRequirements =
            error.error.errors
              .map((item: any) => {

                if (
                  typeof item === 'string'
                ) {
                  return `• ${item}`;
                }

                if (
                  item?.message
                ) {
                  return `• ${item.message}`;
                }

                return null;
              })
              .filter(
                (item: string | null) =>
                  item !== null
              )
              .join('\n');

          Swal.fire({
            icon: 'error',
            title: 'Password Security Requirements',
            text:
              'Your password does not meet the security requirements.',
            html:
              `<p>Your password does not meet the security requirements:</p>
               <div style="text-align: left; margin-top: 10px;">
                 ${passwordRequirements.replace(/\n/g, '<br>')}
               </div>`,
            confirmButtonText: 'Try Again'
          });

          return;
        }

        // ==========================================
        // OTHER ERRORS
        // ==========================================
        const message =
          error?.error?.message ||
          'Registration failed. Please check your information.';

        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: message,
          confirmButtonText: 'Try Again'
        });
      }

    });
  }
}