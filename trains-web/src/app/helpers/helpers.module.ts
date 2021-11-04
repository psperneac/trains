import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ErrorInterceptor} from './error.interceptor';
import {JwtInterceptor} from './jwt.interceptor';
import {EffectsModule} from '@ngrx/effects';
import {AlertEffects} from './alert.effects';

@NgModule({
  declarations: [],
  imports: [
    EffectsModule.forFeature([AlertEffects]),
    CommonModule
  ],
  providers: [
    ErrorInterceptor,
    JwtInterceptor
  ]
})
export class HelpersModule { }
