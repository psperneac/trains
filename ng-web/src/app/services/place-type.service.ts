import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface PlaceTypeDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;
}

export interface PlaceTypesResponse {
  data: PlaceTypeDto[];
  page: number;
  limit: number;
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlaceTypeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiServer;
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  getPlaceTypes(page: number = 1, limit: number = 10): Observable<PlaceTypesResponse> {
    return this.http.get<PlaceTypesResponse>(`${this.apiUrl}/api/place-types?page=${page}&limit=${limit}`, {
      headers: this.getHeaders(),
    });
  }

  getAllPlaceTypes(): Observable<PlaceTypeDto[]> {
    return this.http.get<PlaceTypeDto[]>(`${this.apiUrl}/api/place-types`, {
      headers: this.getHeaders(),
    });
  }

  getPlaceType(id: string): Observable<PlaceTypeDto> {
    return this.http.get<PlaceTypeDto>(`${this.apiUrl}/api/place-types/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createPlaceType(placeType: Omit<PlaceTypeDto, 'id'>): Observable<PlaceTypeDto> {
    return this.http.post<PlaceTypeDto>(`${this.apiUrl}/api/place-types`, placeType, {
      headers: this.getHeaders(),
    });
  }

  updatePlaceType(placeType: PlaceTypeDto): Observable<PlaceTypeDto> {
    return this.http.put<PlaceTypeDto>(`${this.apiUrl}/api/place-types/${placeType.id}`, placeType, {
      headers: this.getHeaders(),
    });
  }

  deletePlaceType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/place-types/${id}`, {
      headers: this.getHeaders(),
    });
  }
}