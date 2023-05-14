import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { VehicleDto } from '../../../../models/vehicle.model';

@Component({
  selector: 'trains-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss']
})
export class VehicleFormComponent implements OnInit, OnDestroy {

  destroy$ = new Subject();

  @Input()
  vehicle: VehicleDto;

  @Output()
  valueChange: EventEmitter<VehicleDto> = new EventEmitter<VehicleDto>();

  vehicleForm: UntypedFormGroup;

  constructor(private readonly formBuilder: UntypedFormBuilder) {}

  ngOnInit() {
    this.vehicleForm = this.toForm(this.vehicle);
    this.vehicleForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(1000),
    ).subscribe(updatedValues => {
      if (updatedValues.content) {
        updatedValues.content = JSON.parse(updatedValues.content);
      } else {
        updatedValues.content = {};
      }

      this.vehicle = { ...this.vehicle, ...updatedValues };
      this.valueChange.emit(this.vehicle);
    })
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

  public valid() {
    return this.vehicleForm?.valid;
  }

  toForm(vehicle: VehicleDto): UntypedFormGroup {
    return this.formBuilder.group({
      id: new UntypedFormControl({ value: vehicle.id, disabled: true }),
      name: new UntypedFormControl(vehicle.name, [Validators.required]),
      type: new UntypedFormControl(vehicle.type, [Validators.required]),
      description: new UntypedFormControl(vehicle.description, [Validators.required]),
      content: new UntypedFormControl(JSON.stringify(vehicle.content || {})),
      engineMax: new UntypedFormControl(vehicle.engineMax, [Validators.required, Validators.pattern('[0-9]+')]),
      engineLoad: new UntypedFormControl(vehicle.engineLoad, [Validators.required, Validators.pattern('[0-9]+')]),
      engineFuel: new UntypedFormControl(vehicle.engineFuel, [Validators.required, Validators.pattern('[0-9]+')]),
      auxMax: new UntypedFormControl(vehicle.auxMax, [Validators.required, Validators.pattern('[0-9]+')]),
      auxLoad: new UntypedFormControl(vehicle.auxLoad, [Validators.required, Validators.pattern('[0-9]+')]),
      auxFuel: new UntypedFormControl(vehicle.auxFuel, [Validators.required, Validators.pattern('[0-9]+')]),
      speed: new UntypedFormControl(vehicle.speed, [Validators.required, Validators.pattern('[0-9]+')]),
    });
  }
}
