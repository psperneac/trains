import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { AuthDataService } from './services/auth-data.service';
import { authReducer } from './store';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './store';
import { AuthService } from './services/auth.service';
import { SharedModule } from '../../shared.module';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [], canDeactivate: [] },
  { path: 'register', component: RegisterComponent, canActivate: [], canDeactivate: [] },
];

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,

    RouterModule.forChild(routes),
    StoreModule.forFeature('auth', authReducer),
    EffectsModule.forFeature([AuthEffects]),
  ],
  providers: [
    AuthService,
    AuthDataService,
  ]
})
export class AuthModule { }
