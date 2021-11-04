import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { authReducer } from './store';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './store';
import { AuthService } from './services/auth.service';
import { SharedModule } from '../../shared.module';
import { AuthGuard } from './guards/auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';

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
    AuthGuard,
    AdminAuthGuard,
  ]
})
export class AuthModule { }
