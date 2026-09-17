import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:5000/api/admin';


  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // GET ALL USERS
  // ==========================================

  getAllUsers() {

    return this.http.get<any>(
      `${this.apiUrl}/users`
    );

  }


  // ==========================================
  // GET ONE USER + JOURNEY
  // ==========================================

  getUserDetails(userId: string) {

    return this.http.get<any>(
      `${this.apiUrl}/users/${userId}`
    );

  }


  // ==========================================
  // DELETE USER
  // ==========================================

  deleteUser(userId: string) {

    return this.http.delete<any>(
      `${this.apiUrl}/users/${userId}`
    );

  }

}