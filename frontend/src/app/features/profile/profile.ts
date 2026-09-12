import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  user: any = null;

  loading = true;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {

    const token = this.authService.getToken();
    const savedUser = this.authService.getUser();

    // No login information found
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    /*
     * First use the user information already saved
     * when the user logged in.
     *
     * This makes the profile appear immediately
     * instead of waiting for the backend.
     */
    if (savedUser) {
      this.user = savedUser;
      this.loading = false;
    }

    /*
     * Try to get the latest information from the backend.
     * If the request takes too long, we keep using the
     * saved user information instead of showing an
     * endless loading screen.
     */

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

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

          // Keep the latest information saved locally
          this.authService.saveAuth(token, response.user);

        }

        this.loading = false;
        this.errorMessage = '';
      },

      error: (error) => {

        console.error('Failed to refresh profile:', error);

        /*
         * If we already have saved user information,
         * don't show an error. The profile can still
         * be displayed normally.
         */

        if (this.user) {

          this.loading = false;
          this.errorMessage = '';

        } else {

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to load your profile. Please try again.';
        }

      }

    });
  }


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

    image.src = '/assets/default-user.png';
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

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }


  get formattedCreatedAt(): string {

    if (!this.user?.createdAt) {
      return 'Not available';
    }

    const date =
      new Date(this.user.createdAt);

    if (isNaN(date.getTime())) {
      return 'Not available';
    }

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }


  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

}