import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PlayerDto } from '../../../models/player';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'trains-player-form',
  templateUrl: './player-form.component.html',
  styleUrls: ['./player-form.component.scss']
})
export class PlayerFormComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();

  @Input()
  player: PlayerDto;

  @Output()
  valueChange = new EventEmitter<PlayerDto>();

  playerForm: UntypedFormGroup;

  constructor(private readonly formBuilder: UntypedFormBuilder) {}

  ngOnInit() {
    this.playerForm = this.toForm(this.player);
    this.playerForm.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(1000)).subscribe(updatedValues => {
      if (updatedValues.content) {
        updatedValues.content = JSON.parse(updatedValues.content);
      } else {
        updatedValues.content = {};
      }

      this.player = { ...this.player, ...updatedValues };
      this.valueChange.emit(this.player);
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  public valid() {
    return this.playerForm?.valid;
  }

  toForm(player: PlayerDto): UntypedFormGroup {
    return this.formBuilder.group({
      id: player.id,
      name: [player.name, [Validators.required]],
      description: [player.description, [Validators.required]],
      content: new UntypedFormControl(JSON.stringify(player.content || {})),
    })
  }
}
