import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  AiScannerService,
  AiScannerResult
} from '../../services/ai-scanner.service';

import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar';

@Component({
  selector: 'app-ai-scanner',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent
  ],
  templateUrl: './ai-scanner.html',
  styleUrl: './ai-scanner.css'
})
export class AiScannerComponent {

  selectedImage: File | null = null;
  imagePreview: string | null = null;

  result: AiScannerResult | null = null;

  isAnalyzing = false;
  errorMessage = '';

  constructor(
    private aiScannerService: AiScannerService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Please select a JPG, PNG, or WEBP image.';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      this.errorMessage = 'The image must be smaller than 8 MB.';
      return;
    }

    this.selectedImage = file;
    this.errorMessage = '';
    this.result = null;

    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }

    this.imagePreview = URL.createObjectURL(file);
  }

  analyzeImage(): void {
    if (!this.selectedImage) {
      this.errorMessage = 'Please select a food image first.';
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      this.errorMessage = 'Please log in again before using the AI Scanner.';
      return;
    }

    this.isAnalyzing = true;
    this.errorMessage = '';
    this.result = null;

    this.aiScannerService
      .analyzeImage(this.selectedImage, token)
      .subscribe({
        next: (response) => {
          console.log('AI SCANNER NEXT CALLBACK FIRED');
          console.log('AI SCANNER RESPONSE:', response);

          this.isAnalyzing = false;

          if (response.success && response.result) {
            console.log('AI SCANNER RESULT SET:', response.result);

            this.result = response.result;
          } else {
            this.errorMessage =
              response.message || 'Unable to analyze the image.';
          }

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.isAnalyzing = false;

          console.error('AI Scanner Error:', error);

          if (error.status === 401) {
            this.errorMessage =
              'Your session has expired. Please log in again.';
          } else if (error.status === 400) {
            this.errorMessage =
              error.error?.message || 'Please select a valid food image.';
          } else if (error.status === 500) {
            this.errorMessage =
              error.error?.message ||
              'Something went wrong while analyzing the image.';
          } else if (error.status === 502) {
            this.errorMessage =
              error.error?.message ||
              'The AI returned an invalid nutrition result.';
          } else {
            this.errorMessage =
              'Could not connect to the AI Scanner. Please try again.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  removeImage(): void {
    this.selectedImage = null;
    this.result = null;
    this.errorMessage = '';

    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
      this.imagePreview = null;
    }

    this.cdr.detectChanges();
  }
}