import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './meal-planner.html',
  styleUrl: './meal-planner.css'
})
export class MealPlannerComponent {
  constructor(private authService: AuthService, private router: Router) {}
  logout(): void { this.authService.logout(); this.router.navigate(['/login']); }
}