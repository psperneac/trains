import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface PlayerDto {
  id: string;
  _id?: string;
  name: string;
  description: string;
  userId: string;
  gameId: string;
  wallet?: {
    balance: number;
    gems: number;
  };
  content?: any;
}

export interface PlayersResponse {
  data: PlayerDto[];
  page: number;
  limit: number;
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
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

  getPlayers(page: number = 1, limit: number = 10): Observable<PlayersResponse> {
    return this.http.get<PlayersResponse>(`${this.apiUrl}/api/players?page=${page}&limit=${limit}`, {
      headers: this.getHeaders(),
    });
  }

  getAllPlayers(): Observable<{ data: PlayerDto[] }> {
    return this.http.get<{ data: PlayerDto[] }>(`${this.apiUrl}/api/players?limit=1000`, {
      headers: this.getHeaders(),
    });
  }

  getPlayersByUserId(userId: string, page: number = 1, limit: number = 10): Observable<PlayersResponse> {
    return this.http.get<PlayersResponse>(
      `${this.apiUrl}/api/players/by-user/${userId}?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  getPlayersByGameId(gameId: string, page: number = 1, limit: number = 10): Observable<PlayersResponse> {
    return this.http.get<PlayersResponse>(
      `${this.apiUrl}/api/players/by-game/${gameId}?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  getPlayer(id: string): Observable<PlayerDto> {
    return this.http.get<PlayerDto>(`${this.apiUrl}/api/players/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createPlayer(player: Omit<PlayerDto, 'id'>): Observable<PlayerDto> {
    return this.http.post<PlayerDto>(`${this.apiUrl}/api/players`, player, {
      headers: this.getHeaders(),
    });
  }

  updatePlayer(player: PlayerDto): Observable<PlayerDto> {
    const id = player.id || player._id;
    return this.http.put<PlayerDto>(`${this.apiUrl}/api/players/${id}`, player, {
      headers: this.getHeaders(),
    });
  }

  deletePlayer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/players/${id}`, {
      headers: this.getHeaders(),
    });
  }
}