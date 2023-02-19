import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PlaceDto } from "../../../models/place.model";

@Component({
  selector: 'trains-place-form',
  templateUrl: './place-form.component.html',
  styleUrls: ['./place-form.component.scss']
})
export class PlaceFormComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();

  @Input()
  place: PlaceDto;

  @Output()
  valueChange: EventEmitter<PlaceDto> = new EventEmitter<PlaceDto>();

  placeForm: UntypedFormGroup;

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit() {
    this.placeForm = this.toForm(this.place);
    this.placeForm.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(1000)).subscribe(updatedValues => {
      this.place = { ...this.place, ...updatedValues };
      this.valueChange.emit(this.place);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  public externalPlaceUpdate(place: PlaceDto) {
    this.placeForm.controls['lat'].setValue(place.lat);
    this.placeForm.controls['long'].setValue(place.long);
  }

  toForm(place: PlaceDto): UntypedFormGroup {
    return this.formBuilder.group({
      id: new UntypedFormControl({ value: place.id, disabled: true }),
      name: new UntypedFormControl(place.name, [Validators.required]),
      description: new UntypedFormControl(place.description, [Validators.required]),
      type: new UntypedFormControl(place.type, [Validators.required]),
      lat: new UntypedFormControl(place.lat, [
        Validators.required,
        Validators.pattern('^[-+]?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?)$'),
        Validators.max(90),
        Validators.min(-90)]),
      long: new UntypedFormControl(place.long, [
        Validators.required,
        Validators.pattern('^[-+]?(180(\\.0+)?|((1[0-7]\\d)|([1-9]?\\d))(\\.\\d+)?)$'),
        Validators.max(180),
        Validators.min(-180)])
    });
  }

  public valid(): boolean {
    return this.placeForm.valid;
  }
}
