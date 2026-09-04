import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin(): void {

    if (!this.email || !this.password) {
      alert('Please enter your email and password.');
      return;
    }

    this.isLoading = true;

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>(
      'http://localhost:5000/api/auth/login',
      loginData
    ).subscribe({

      next: (response) => {

        console.log('Login successful:', response);

        if (response.token && response.user) {
          this.authService.saveAuth(response.token, response.user);
        }

        this.router.navigate(['/dashboard']);

        this.isLoading = false;
      },

      error: (error) => {

        console.error('Login failed:', error);

        const message =
          error?.error?.message ||
          'Invalid email or password.';

        alert(message);

        this.isLoading = false;
      }
    });
  }
}