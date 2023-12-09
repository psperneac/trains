import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { MapTemplateDto } from '../../../models/map-template.model';

@Component({
  selector: 'trains-map-template-form',
  templateUrl: './map-template-form.component.html',
  styleUrls: ['./map-template-form.component.scss']
})
export class MapTemplateFormComponent implements OnInit, OnDestroy {

  destroy$ = new Subject();

  @Input()
  map: MapTemplateDto;

  @Output()
  valueChange = new EventEmitter<MapTemplateDto>();

  form: FormGroup;

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.toForm(this.map);
    this.form.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(1000)
    ).subscribe(updatedValues => {
      if (updatedValues.content) {
        updatedValues.content = JSON.parse(updatedValues.content);
      } else {
        updatedValues.content = {};
      }

      this.map = { ...this.map, ...updatedValues};
      this.valueChange.emit(this.map);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  valid(): boolean {
    return this.form.valid;
  }

  private toForm(map: MapTemplateDto): FormGroup {
    return this.formBuilder.group({
      id: [{ value: map.id, disabled: true}],
      name: [map.name, Validators.required],
      description: [map.description],
      content: [JSON.stringify(map.content)]
    });
  }
}
