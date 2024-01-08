import {Injectable} from "@angular/core";
import {User} from "../store";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import urljoin from 'url-join';

@Injectable()
export class AuthService {
  constructor(private httpClient: HttpClient) {
  }

  login(email: string, password: string): Observable<User> {
    return this.httpClient.post<User>(urljoin(environment.api, 'api/authentication/login'), {email, password});
  }

  register(username: string, email: string, password: string): Observable<User> {
    return this.httpClient.post<User>(urljoin(environment.api, '/api/authentication/register'), {username, email, password});
  }

  logout(): Observable<boolean> {
    return this.httpClient.post<boolean>(urljoin(environment.api, '/api/authentication/logout'), {});
  }
}
