import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { PlaceTypeDto } from '../../../models/place-type.model';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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

  placeTypeForm: UntypedFormGroup;

  constructor(private readonly formBuilder: UntypedFormBuilder) {}

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
    this.destroy$.next(true);
  }

  public valid() {
    return this.placeTypeForm.valid;
  }

  toForm(placeType: PlaceTypeDto): UntypedFormGroup {
    return this.formBuilder.group({
      id: new UntypedFormControl({ value: placeType.id, disabled: true }),
      name: new UntypedFormControl(placeType.name, [Validators.required]),
      type: new UntypedFormControl(placeType.type, [Validators.required]),
      description: new UntypedFormControl(placeType.description, [Validators.required]),
    })
  }
}
