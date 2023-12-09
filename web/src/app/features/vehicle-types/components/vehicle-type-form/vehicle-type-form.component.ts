import { takeUntil, debounceTime } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { VehicleTypeDto } from '../../../../models/vehicle-type.model';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'trains-vehicle-type-form',
  templateUrl: './vehicle-type-form.component.html',
  styleUrls: ['./vehicle-type-form.component.scss']
})
export class VehicleTypeFormComponent implements OnInit, OnDestroy {

  destroy$ = new Subject();

  @Input()
  vehicleType: VehicleTypeDto;

  @Output()
  valueChange: EventEmitter<VehicleTypeDto> = new EventEmitter<VehicleTypeDto>();

  vehicleTypeForm: UntypedFormGroup;

  constructor(private readonly formBuilder: UntypedFormBuilder) { }

  ngOnInit() {
    this.vehicleTypeForm = this.toForm(this.vehicleType);
    this.vehicleTypeForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(1000)
    ).subscribe(updatedValues => {
      if (updatedValues.content) {
        updatedValues.content = JSON.parse(updatedValues.content);
      } else {
        updatedValues.content = {};
      }

      this.vehicleType = { ...this.vehicleType, ...updatedValues};
      this.valueChange.emit(this.vehicleType);
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

  public valid() {
    return this.vehicleTypeForm?.valid;
  }

  toForm(vehicleType: VehicleTypeDto): UntypedFormGroup {
    return this.formBuilder.group({
      id: new UntypedFormControl({ value: vehicleType.id, disabled: true }),
      name: new UntypedFormControl(vehicleType.name, [Validators.required]),
      type: new UntypedFormControl(vehicleType.type, [Validators.required]),
      description: new UntypedFormControl(vehicleType.description, [Validators.required]),
      content: new UntypedFormControl(JSON.stringify(vehicleType.content || {})),
    });
  }
}
