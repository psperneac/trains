import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Observable } from 'rxjs';
import { DisplayPlaceConnection } from '../../features/map-templates/pages/map-template-edit.page';
import { PlaceConnectionDto } from '../../models/place-connection.model';

export interface SelectPlaceConnectionComponentData {
  title: string,
  placesConnections$: Observable<DisplayPlaceConnection[]>,
}

@Component({
  selector: 'app-select-place-connection',
  templateUrl: './select-place-connection.component.html',
  styleUrl: './select-place-connection.component.scss'
})
export class SelectPlaceConnectionComponent {
  selectedPlaceConnection: PlaceConnectionDto[];

  placeConnections$: Observable<DisplayPlaceConnection[]>;
  title = 'component.select-place-connection.title';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SelectPlaceConnectionComponentData) {
    this.placeConnections$ = data.placesConnections$;
    if (data.title) {
      this.title = data.title;
    }
  }

  selectionChange($event: MatSelectChange) {
    console.log('selectionChange', $event);
    this.selectedPlaceConnection = $event.value;
  }
}
