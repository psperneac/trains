import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert/alert.component';
import { ComponentsRoutingModule } from './components-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { HomePageComponent } from './home-page/home-page.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CustomMapComponent } from './custom-map/custom-map.component';
import { NgxLoadingControlModule } from '@runette/ngx-leaflet-loading';
import { NgxLeafletLocateModule } from '@runette/ngx-leaflet-locate';
import { NgxLeafletFullscreenModule } from '@runette/ngx-leaflet-fullscreen';

@NgModule({
  imports: [
    CommonModule,
    ComponentsRoutingModule,
    ReactiveFormsModule,
    LeafletModule,
    NgxLoadingControlModule,
    NgxLeafletLocateModule,
    NgxLeafletFullscreenModule,
  ],
  declarations: [
    AlertComponent,
    CustomMapComponent,
    HomePageComponent
  ],
  exports: [
    CustomMapComponent,
    AlertComponent,
  ]
})
export class ComponentsModule { }
