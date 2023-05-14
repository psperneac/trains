import { ChangeDetectorRef, Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppState } from './store';
import { select, Store } from '@ngrx/store';
import { selectLoggedIn, logout } from './features/auth/store';
import { Route, Router } from '@angular/router';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { DEFAULT_IDLE, DEFAULT_KEEPALIVE, DEFAULT_TIMEOUT } from './utils/constants';
import { UiService } from './services/ui.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthFacade } from './features/auth/store/auth.facade';

@Component({
  selector: 'trains-web-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy, DoCheck {
  destroy$ = new Subject();

  currentTitle = 'application.title';
  newTitle = 'application.title';
  language = 'en-US';

  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  modalTitle = 'angular-idle-timeout';

  loggedIn$ = this.store.pipe(select(selectLoggedIn));

  isAdmin$ = this.authFacade.isAdmin$;

  constructor(
    private readonly translate: TranslateService,
    private readonly store: Store<AppState>,
    private router: Router,
    private readonly idle: Idle,
    private readonly keepalive: Keepalive,
    private readonly uiService: UiService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly authFacade: AuthFacade) {
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);

    idle.setIdle(DEFAULT_IDLE);
    idle.setTimeout(DEFAULT_TIMEOUT);
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle';
      console.log(this.idleState);
      this.reset();
    });

    idle.onTimeout.subscribe(() => {
      this.idleState = 'Timeod Out!';
      this.timedOut = true;
      console.log(this.idleState);
      this.router.navigate(['/']);
    });

    idle.onIdleStart.subscribe(() => {
      this.idleState = 'You\'ve gone idle!';
      console.log(this.idleState);
      // this.childModal.show();
    });

    idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'You will timeout in ' + countdown + ' seconds!';
      console.log(this.idleState);
    });

    this.keepalive.interval(DEFAULT_KEEPALIVE);
    this.keepalive.onPing.subscribe(() => {
      this.lastPing = new Date();
    });

    this.reset();
  }

  reset() {
    console.log('Idle timeout started!');
    this.idle.watch();
    this.idleState = 'Started';
    this.timedOut = false;
  }

  logout() {
    this.store.dispatch(logout());
  }

  menuClicked(tag: string) {
    switch (tag) {
      case 'home':
        this.router.navigate(['/home']);
        break;
      case 'places':
        this.router.navigate(['/places']);
        break;
      case 'placeTypes':
        this.router.navigate(['/place-types']);
        break;
      case 'vehicleTypes':
        this.router.navigate(['/vehicle-types']);
        break;
      case 'vehicles':
        this.router.navigate(['/vehicles']);
        break;
      }
  }

  ngOnInit(): void {
    this.printpath('', this.router.config);

    this.uiService.pageTitle$.pipe(takeUntil(this.destroy$)).subscribe(value => {
      // this.newTitle = this.translate.instant(value || '');
      this.newTitle = value || '';
      this.changeDetectorRef.detectChanges();
    });
  }

  ngDoCheck(): void {
    if (this.currentTitle !== this.newTitle) {
      this.currentTitle = this.newTitle;
    }
  }

  ngOnDestroy(): void {
    console.log('AppComponent - destroyed');
    this.destroy$.next(true);
  }

  printpath(parent: String, config: Route[]) {
    for (let i = 0; i < config.length; i++) {
      const route = config[i];
      console.log(parent + '/' + route.path);
      if (route.children) {
        const currentPath = route.path ? parent + '/' + route.path : parent;
        this.printpath(currentPath, route.children);
      }
    }
  }
}
