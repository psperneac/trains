import {HttpClient} from "@angular/common/http";
import {PageRequestDto} from "../models/pagination.model";
import {Observable} from "rxjs";
import {PageDto} from "../models/page.model";
import {environment} from "../../environments/environment";
import {toParams} from "./http.helpers";
import urljoin from 'url-join';

export class AbstractService<T> {
  constructor(public httpClient: HttpClient, public path: string) {}

  getAll(pagination: PageRequestDto): Observable<PageDto<T>> {
    return this.httpClient.get<PageDto<T>>(urljoin(environment.api, this.path), {
      params: toParams(pagination)
    });
  }

  get(uuid: string): Observable<T> {
    return this.httpClient.get<T>(urljoin(environment.api, this.path, uuid));
  }

  create(entity: T): Observable<T> {
    return this.httpClient.post<T>(urljoin(environment.api, this.path), entity);
  }

  update(uuid: string, entity: T): Observable<T> {
    return this.httpClient.put<T>(urljoin(environment.api, this.path, uuid), entity);
  }

  delete(uuid: string): Observable<boolean> {
    return this.httpClient.delete<boolean>(urljoin(environment.api, this.path, uuid));
  }
}
