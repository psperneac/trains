import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  _id: string;
  created: string;
  updated: string;
  username: string;
  email: string;
  scope: string;
  authToken: string;
}

export interface RegisterResponse {
  _id: string;
  created: string;
  updated: string;
  username: string;
  email: string;
  scope: string;
  authToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiServer;

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/authentication/login`, {
      email,
      password,
    });
  }

  register(email: string, username: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/api/authentication/register`, {
      email,
      username,
      password,
    });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/authentication/logout`, {});
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/authentication/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
