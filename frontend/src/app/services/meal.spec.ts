import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  private apiUrl = 'http://localhost:5000/api/meals';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  getMeals(date?: string): Observable<any> {
    const url = date
      ? `${this.apiUrl}?date=${date}`
      : this.apiUrl;

    return this.http.get(url, {
      headers: this.getHeaders()
    });
  }

  getMealById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  createMeal(meal: any): Observable<any> {
    return this.http.post(
      this.apiUrl,
      meal,
      { headers: this.getHeaders() }
    );
  }

  updateMeal(id: string, meal: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      meal,
      { headers: this.getHeaders() }
    );
  }

  deleteMeal(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}