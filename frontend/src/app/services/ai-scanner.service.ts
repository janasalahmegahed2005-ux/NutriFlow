import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiScannerResult {
  foodName: string;
  description: string;
  estimatedServingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: number;
}

export interface AiScannerResponse {
  success: boolean;
  result: AiScannerResult;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiScannerService {

  private apiUrl = 'http://localhost:5000/api/ai-scanner';

  constructor(private http: HttpClient) {}

  analyzeImage(
    image: File,
    token: string
  ): Observable<AiScannerResponse> {

    const formData = new FormData();

    formData.append('image', image);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<AiScannerResponse>(
      `${this.apiUrl}/analyze`,
      formData,
      { headers }
    );
  }
}