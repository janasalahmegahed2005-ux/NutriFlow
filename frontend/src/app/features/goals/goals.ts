import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './goals.html',
  styleUrl: './goals.css'
})
export class GoalsComponent {

  user: any = null;

  constructor(private authService: AuthService) {
    this.user = this.authService.getUser();
  }

  get firstName(): string { return this.user?.firstName || 'User'; }
  get calorieTarget(): number { return this.user?.calorieTarget || 2000; }
  get proteinTarget(): number { return this.user?.proteinTarget || 120; }
  get carbsTarget(): number { return this.user?.carbsTarget || 250; }
  get fatTarget(): number { return this.user?.fatTarget || 65; }
  get goal(): string { return this.user?.goal || 'No goal set yet.'; }
  get weight(): number { return this.user?.weight || 0; }
  get height(): number { return this.user?.height || 0; }
  get gender(): string { return this.user?.gender || ''; }

  get bmi(): number {
    if (!this.weight || !this.height) return 0;
    const heightM = this.height / 100;
    return Math.round((this.weight / (heightM * heightM)) * 10) / 10;
  }

  get bmiCategory(): string {
    if (this.bmi < 18.5) return 'Underweight';
    if (this.bmi < 25) return 'Normal weight';
    if (this.bmi < 30) return 'Overweight';
    return 'Obese';
  }

  get bmiColor(): string {
    if (this.bmi < 18.5) return '#91b9c9';
    if (this.bmi < 25) return '#405c36';
    if (this.bmi < 30) return '#e7b08e';
    return '#d7a6ad';
  }
}