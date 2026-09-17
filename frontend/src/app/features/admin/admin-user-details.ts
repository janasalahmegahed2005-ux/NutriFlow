import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { AdminService } from '../../services/admin.service';


@Component({
  selector: 'app-admin-user-details',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './admin-user-details.html',

  styleUrl: './admin-user-details.css'
})
export class AdminUserDetailsComponent implements OnInit {

  user = signal<any | null>(null);

  journey = signal<any | null>(null);

  loading = signal(false);

  deleting = signal(false);

  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}


  // ==========================================
  // INITIALIZE PAGE
  // ==========================================

  ngOnInit(): void {

    const userId =
      this.route.snapshot.paramMap.get('userId');

    if (!userId) {

      this.errorMessage.set(
        'User ID was not provided.'
      );

      return;
    }

    this.loadUserDetails(userId);
  }


  // ==========================================
  // LOAD USER DETAILS
  // ==========================================

  loadUserDetails(userId: string): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.adminService
      .getUserDetails(userId)
      .subscribe({

        next: (response) => {

          this.user.set(
            response.user || null
          );

          this.journey.set(
            response.journey || null
          );

          this.loading.set(false);
        },

        error: (error) => {

          console.error(
            'Failed to load user details:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load user details.'
          );

          this.loading.set(false);
        }

      });
  }


  // ==========================================
  // DELETE USER
  // ==========================================

  deleteUser(): void {

    const userId =
      this.route.snapshot.paramMap.get('userId');

    if (!userId) {

      this.errorMessage.set(
        'User ID was not provided.'
      );

      return;
    }


    const currentUser =
      this.user();

    const userName =
      currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : 'this user';


    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${userName}'s account?\n\nThis will permanently delete the account and its associated NutriFlow data.`
      );


    if (!confirmed) {
      return;
    }


    this.deleting.set(true);

    this.errorMessage.set('');


    this.adminService
      .deleteUser(userId)
      .subscribe({

        next: (response) => {

          console.log(
            'User deleted:',
            response
          );

          this.deleting.set(false);

          this.router.navigate([
            '/admin'
          ]);

        },

        error: (error) => {

          console.error(
            'Failed to delete user:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to delete user account.'
          );

          this.deleting.set(false);
        }

      });
  }


  // ==========================================
  // BACK TO ADMIN DASHBOARD
  // ==========================================

  goBack(): void {

    this.router.navigate([
      '/admin'
    ]);

  }

}