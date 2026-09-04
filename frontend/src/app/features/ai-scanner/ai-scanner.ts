import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ai-scanner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ai-scanner.html',
  styleUrl: './ai-scanner.css'
})
export class AiScannerComponent {
  constructor(private authService: AuthService, private router: Router) {}
  logout(): void { this.authService.logout(); this.router.navigate(['/login']); }
}