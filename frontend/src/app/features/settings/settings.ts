import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent {

  user: any = null;
  saving = false;
  saved = false;
  errorMessage = '';

  firstName = '';
  lastName = '';
  email = '';
  weight = 0;
  height = 0;
  goal = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.user = this.authService.getUser();
    this.firstName = this.user?.firstName || '';
    this.lastName = this.user?.lastName || '';
    this.email = this.user?.email || '';
    this.weight = this.user?.weight || 0;
    this.height = this.user?.height || 0;
    this.goal = this.user?.goal || '';
  }

  get displayName(): string { return this.user?.firstName || 'User'; }
  get gender(): string { return this.user?.gender || ''; }
  get dateOfBirth(): string { return this.user?.dateOfBirth ? new Date(this.user.dateOfBirth).toLocaleDateString() : ''; }

  saveSettings(): void {
    if (this.saving) return;
    this.saving = true;
    this.saved = false;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const updates = {
      firstName: this.firstName,
      lastName: this.lastName,
      weight: Number(this.weight),
      height: Number(this.height),
      goal: this.goal,
    };

    this.http.put<any>(
      'http://localhost:5000/api/profile',
      updates,
      { headers }
    ).subscribe({
      next: (response: any) => {
        const updatedUser = { ...this.user, ...updates };
        if (response.user) {
          Object.assign(updatedUser, response.user);
        }
        this.authService.saveAuth(token!, updatedUser);
        this.user = updatedUser;
        this.saving = false;
        this.saved = true;
        this.cdr.detectChanges();
        setTimeout(() => { this.saved = false; this.cdr.detectChanges(); }, 3000);
      },
      error: (error: any) => {
        this.errorMessage = error?.error?.message || 'Failed to save settings.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}