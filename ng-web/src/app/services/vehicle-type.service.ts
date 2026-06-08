import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface VehicleTypeDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;
}

export interface VehicleTypesResponse {
  data: VehicleTypeDto[];
  page: number;
  limit: number;
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class VehicleTypeService {
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

  getVehicleTypes(page: number = 1, limit: number = 0): Observable<VehicleTypesResponse> {
    return this.http.get<VehicleTypesResponse>(`${this.apiUrl}/api/vehicle-types?page=${page}&limit=${limit}`, {
      headers: this.getHeaders(),
    });
  }

  getAllVehicleTypes(): Observable<VehicleTypeDto[]> {
    return this.http.get<VehicleTypeDto[]>(`${this.apiUrl}/api/vehicle-types`, {
      headers: this.getHeaders(),
    });
  }

  getVehicleType(id: string): Observable<VehicleTypeDto> {
    return this.http.get<VehicleTypeDto>(`${this.apiUrl}/api/vehicle-types/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createVehicleType(vehicleType: Omit<VehicleTypeDto, 'id'>): Observable<VehicleTypeDto> {
    return this.http.post<VehicleTypeDto>(`${this.apiUrl}/api/vehicle-types`, vehicleType, {
      headers: this.getHeaders(),
    });
  }

  updateVehicleType(vehicleType: VehicleTypeDto): Observable<VehicleTypeDto> {
    return this.http.put<VehicleTypeDto>(`${this.apiUrl}/api/vehicle-types/${vehicleType.id}`, vehicleType, {
      headers: this.getHeaders(),
    });
  }

  deleteVehicleType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/vehicle-types/${id}`, {
      headers: this.getHeaders(),
    });
  }
}