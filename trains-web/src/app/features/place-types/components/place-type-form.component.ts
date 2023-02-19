import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { PlaceTypeDto } from '../../../models/place-type.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'trains-place-type-form',
  templateUrl: './place-type-form.component.html',
  styleUrls: ['./place-type-form.component.scss']
})
export class PlaceTypeFormComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();

  @Input()
  placeType: PlaceTypeDto;

  @Output()
  valueChange: EventEmitter<PlaceTypeDto> = new EventEmitter<PlaceTypeDto>();

  placeTypeForm: FormGroup;

  constructor(private readonly formBuilder: FormBuilder) {}

  ngOnInit() {
    this.placeTypeForm = this.toForm(this.placeType);
    this.placeTypeForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(1000)
    ).subscribe(updatedValues => {
      this.placeType = { ...this.placeType, ...updatedValues};
      this.valueChange.emit(this.placeType);
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  public valid() {
    return this.placeTypeForm.valid;
  }

  toForm(placeType: PlaceTypeDto): FormGroup {
    return this.formBuilder.group({
      id: new FormControl({ value: placeType.id, disabled: true }),
      name: new FormControl(placeType.name, [Validators.required]),
      type: new FormControl(placeType.type, [Validators.required]),
      description: new FormControl(placeType.description, [Validators.required]),
    })
  }
}
