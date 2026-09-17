import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  Router
} from '@angular/router';

import { AdminService } from '../../services/admin.service';

import { SidebarComponent } from '../../shared/sidebar';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    SidebarComponent
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})


export class AdminComponent implements OnInit {

  users = signal<any[]>([]);

  loading = signal(false);

  errorMessage = signal('');

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.adminService.getAllUsers().subscribe({

      next: (response) => {

        this.users.set(
          response.users || []
        );

        this.loading.set(false);
      },

      error: (error) => {

        console.error(
          'Failed to load users:',
          error
        );

        this.errorMessage.set(
          error.error?.message ||
          'Failed to load users.'
        );

        this.loading.set(false);
      }

    });
  }

  viewUser(userId: string): void {

    this.router.navigate([
      '/admin/users',
      userId
    ]);

  }

}