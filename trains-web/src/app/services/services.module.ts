import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigService } from './config.service';
import { MapService } from './map.service';
import { UiService } from './ui.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    ConfigService,
    UiService,
    MapService,
  ]
})
export class ServicesModule { }
