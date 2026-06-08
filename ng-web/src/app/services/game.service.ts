import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface GameDto {
  id: string;
  name: string;
  description: string;
  type: string;
  content: any;
}

export interface GamesResponse {
  data: GameDto[];
  page: number;
  limit: number;
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
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

  getGames(page: number = 1, limit: number = 10): Observable<GamesResponse> {
    return this.http.get<GamesResponse>(`${this.apiUrl}/api/games?page=${page}&limit=${limit}`, {
      headers: this.getHeaders(),
    });
  }

  getAllGames(): Observable<{ data: GameDto[] }> {
    return this.http.get<{ data: GameDto[] }>(`${this.apiUrl}/api/games?limit=1000`, {
      headers: this.getHeaders(),
    });
  }

  getGame(id: string): Observable<GameDto> {
    return this.http.get<GameDto>(`${this.apiUrl}/api/games/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createGame(game: Omit<GameDto, 'id'>): Observable<GameDto> {
    return this.http.post<GameDto>(`${this.apiUrl}/api/games`, game, {
      headers: this.getHeaders(),
    });
  }

  updateGame(game: GameDto): Observable<GameDto> {
    return this.http.put<GameDto>(`${this.apiUrl}/api/games/${game.id}`, game, {
      headers: this.getHeaders(),
    });
  }

  deleteGame(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/games/${id}`, {
      headers: this.getHeaders(),
    });
  }
}