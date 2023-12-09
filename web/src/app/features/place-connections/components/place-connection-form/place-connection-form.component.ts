import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { PlaceConnectionDto } from '../../../../models/place-connection.model';
import { PlaceDto } from '../../../../models/place.model';
import { PlaceDataService } from '../../../places/services/place-data.service';
import { keys, values } from 'lodash';

@Component({
  selector: 'trains-place-connection-form',
  templateUrl: './place-connection-form.component.html',
  styleUrls: ['./place-connection-form.component.scss']
})
export class PlaceConnectionFormComponent implements OnInit, OnDestroy {

  destroy$ = new Subject();

  placesById$: Observable<PlaceDto[]> = this.placesDataService.placesById$().pipe(map(m => values(m)));

  @Input()
  placeConnection: PlaceConnectionDto;

  @Output()
  valueChange = new EventEmitter<PlaceConnectionDto>();

  form: FormGroup;
  private placesMap: { [p: string]: PlaceDto };

  constructor(
    private readonly placesDataService: PlaceDataService,
    private readonly formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.placesDataService.placesById$().pipe(takeUntil(this.destroy$))
      .subscribe(map => this.placesMap = map);

    this.form = this.toForm(this.placeConnection);
    this.form.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(1000)
    ).subscribe(updatedValues => {
      if (updatedValues.content) {
        updatedValues.content = JSON.parse(updatedValues.content);
      } else {
        updatedValues.content = {};
      }

      this.placeConnection = { ...this.placeConnection, ...updatedValues};
      this.valueChange.emit(this.placeConnection);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  valid(): boolean {
    return this.form.valid;
  }

  allPlacesIds() {
    return this.placesMap ? keys(this.placesMap) : [];
  }

  placeById(id) {
    return this.placesMap ? this.placesMap[id] : null;
  }

  toForm(connection: PlaceConnectionDto): FormGroup {
    return this.formBuilder.group({
      id: new FormControl({ value: connection.id, disabled: true }),
      name: new FormControl(connection.name, [Validators.required]),
      type: new FormControl(connection.type, [Validators.required]),
      description: new FormControl(connection.description, [Validators.required]),
      content: new FormControl(JSON.stringify(connection.content || {})),
      startId: new FormControl(connection.startId, [Validators.required]),
      endId: new FormControl(connection.endId, [Validators.required]),
    })
  }
}
