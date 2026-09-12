import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MealPlan {
  _id?: string;
  user?: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food?: string;
  recipe?: string;
  quantity?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  vitamins?: string[];
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MealPlanResponse {
  success: boolean;
  count?: number;
  mealPlans?: MealPlan[];
  mealPlan?: MealPlan;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MealPlanService {

  private apiUrl = 'http://localhost:5000/api/meal-plans';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('nutriflow_token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  // GET ALL MEAL PLANS
getMealPlans(date?: string): Observable<MealPlanResponse> {
  let url = this.apiUrl;

  if (date) {
    url += `?date=${encodeURIComponent(date)}`;
  }

  const separator = url.includes('?') ? '&' : '?';

  url += `${separator}_=${Date.now()}`;

  return this.http.get<MealPlanResponse>(url, {
    headers: this.getHeaders()
  });
}

  // GET ONE MEAL PLAN
  getMealPlanById(id: string): Observable<MealPlanResponse> {
    return this.http.get<MealPlanResponse>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // CREATE MEAL PLAN
  createMealPlan(mealPlan: MealPlan): Observable<MealPlanResponse> {
    return this.http.post<MealPlanResponse>(
      this.apiUrl,
      mealPlan,
      {
        headers: this.getHeaders()
      }
    );
  }

  // UPDATE MEAL PLAN
  updateMealPlan(
    id: string,
    mealPlan: MealPlan
  ): Observable<MealPlanResponse> {
    return this.http.put<MealPlanResponse>(
      `${this.apiUrl}/${id}`,
      mealPlan,
      {
        headers: this.getHeaders()
      }
    );
  }

  // DELETE MEAL PLAN
  deleteMealPlan(id: string): Observable<MealPlanResponse> {
    return this.http.delete<MealPlanResponse>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}