import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private readonly pageTitle = new BehaviorSubject<string>('page.title');
  public pageTitle$ = this.pageTitle.asObservable();

  constructor() {}

  public setPageTitle(value: string) {
    this.pageTitle.next(value);
  }
}
