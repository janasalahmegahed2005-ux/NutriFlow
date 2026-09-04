import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  dateOfBirth: string = '';
  gender: string = '';
  weight: string = '';
  height: string = '';
  goal: string = '';

  selectedImage: File | null = null;
  imagePreview: string = '/assets/default-user.png';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    this.selectedImage = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onRegister(event: Event): void {

    if (!this.firstName.trim()) {
      alert('Please enter your first name.');
      return;
    }

    if (!this.lastName.trim()) {
      alert('Please enter your last name.');
      return;
    }

    if (!this.email.trim()) {
      alert('Please enter your email.');
      return;
    }

    if (!this.gender) {
      alert('Please select your gender.');
      return;
    }

    if (!this.dateOfBirth) {
      alert('Please enter your date of birth.');
      return;
    }

    if (!this.weight || Number(this.weight) <= 0) {
      alert('Please enter your weight.');
      return;
    }

    if (!this.height || Number(this.height) <= 0) {
      alert('Please enter your height.');
      return;
    }

    if (!this.goal.trim()) {
      alert('Please describe your wellness goal.');
      return;
    }

    if (!this.password) {
      alert('Please create a password.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Edge fix: remap familyName → lastName
    const familyName = formData.get('familyName');
    formData.delete('familyName');
    if (familyName !== null) {
      formData.append('lastName', familyName as string);
    }

    // Remove confirmPassword — backend doesn't need it
    formData.delete('confirmPassword');

    this.http.post(
      'http://localhost:5000/api/auth/register',
      formData
    ).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        alert('Account created successfully!');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        const message =
          error?.error?.message ||
          'Registration failed. Please check your information.';
        alert(message);
      }
    });
  }
}