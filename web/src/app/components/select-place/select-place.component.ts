import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { PlaceDto } from '../../models/place.model';

export interface SelectPlaceComponentData {
  title: string,
  places$: Observable<PlaceDto[]>,
}

@Component({
  selector: 'trains-select-place',
  templateUrl: './select-place.component.html',
  styleUrl: './select-place.component.scss'
})
export class SelectPlaceComponent {

  selectedPlace: PlaceDto[];

  places$: Observable<PlaceDto[]>;
  title = 'component.select-place.title';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SelectPlaceComponentData) {
    this.places$ = data.places$;
    if (data.title) {
      this.title = data.title;
    }
  }

  selectionChange($event: MatSelectChange) {
    console.log('selectionChange', $event);
    this.selectedPlace = $event.value;
  }
}
