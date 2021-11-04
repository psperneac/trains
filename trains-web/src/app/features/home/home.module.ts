import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { HomePageComponent } from './pages/home-page/home-page.component';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  imports: [
    ComponentsModule,

    CommonModule,
    HomeRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [
    HomePageComponent
  ],
  exports: []
})
export class HomeModule { }
