import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  identifier: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin(): void {

    if (!this.identifier || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter your email/username and password.',
        confirmButtonText: 'OK'
      });

      return;
    }

    this.isLoading = true;

    const loginData = {
      identifier: this.identifier,
      password: this.password
    };

    this.http.post<any>(
      'http://localhost:5000/api/auth/login',
      loginData
    ).subscribe({

      next: (response) => {

        console.log('Login successful:', response);

        if (response.token && response.user) {
          this.authService.saveAuth(
            response.token,
            response.user
          );
        }

        this.router.navigate(['/dashboard']);

        this.isLoading = false;
      },

      error: (error) => {

        console.error('Login failed:', error);

        const message =
          error?.error?.message ||
          'Invalid email/username or password.';

        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: message,
          confirmButtonText: 'Try Again'
        });

        this.isLoading = false;
      }

    });
  }
}