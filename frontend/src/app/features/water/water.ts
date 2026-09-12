import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar';

@Component({
  selector: 'app-water',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './water.html',
  styleUrl: './water.css'
})
export class WaterComponent implements OnInit {

  user: any = null;
  waterLog: any[] = [];
  totalWater = 0;
  waterTarget = 2500;
  customAmount = 250;
  loading = false;
  saving = false;
  errorMessage = '';
  today = this.getTodayDate();
  quickAmounts = [150, 250, 350, 500];

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void { this.loadWater(); }

  get waterPercentage(): number {
    return Math.min(100, Math.round((this.totalWater / this.waterTarget) * 100));
  }

  get waterRemaining(): number { return Math.max(0, this.waterTarget - this.totalWater); }

  get firstName(): string { return this.user?.firstName || 'User'; }

  loadWater(): void {
    this.loading = true;
    this.cdr.detectChanges();
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`http://localhost:5000/api/water?date=${this.today}`, { headers }).subscribe({
      next: (response: any) => {
        this.waterLog = response.water || response.logs || response.entries || [];
        this.totalWater = this.waterLog.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  addWater(amount: number): void {
    if (this.saving) return;
    this.saving = true;
    this.cdr.detectChanges();
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });
    this.http.post<any>('http://localhost:5000/api/water', { amount, date: this.today }, { headers }).subscribe({
      next: (response: any) => {
        this.totalWater += amount;
        const entry = response.water || response.entry || response.log || { amount, date: this.today };
        this.waterLog = [...this.waterLog, entry];
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: () => { this.totalWater += amount; this.saving = false; this.cdr.detectChanges(); }
    });
  }

  addCustomWater(): void {
    if (!this.customAmount || this.customAmount <= 0) return;
    this.addWater(this.customAmount);
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}