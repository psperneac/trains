import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { PlaceTypeDto } from '../../../models/place-type.model';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { UiService } from '../../../services/ui.service';
import { Router } from '@angular/router';
import { PlaceFormComponent } from '../../places/components/place-form.component';
import { PLACE_TYPES } from '../../../utils/constants';
import { PlaceTypeActions } from '../store/place-type.actions';
import { PlaceTypeSelectors } from '../store/place-type.selectors';
import { filter, take } from 'rxjs/operators';
import { cloneDeep, isNil } from 'lodash';

@Component({
  selector: 'trains-place-type-create-page',
  templateUrl: './place-type-edit.page.html',
  styleUrls: ['./place-type-edit.page.scss']
})
export class PlaceTypeEditPage implements OnInit, OnDestroy {
  destroy$ = new Subject();

  placeType: PlaceTypeDto;

  @ViewChild('placeForm')
  form: PlaceFormComponent;

  constructor(
    private store: Store<AppState>,
    private readonly router: Router,
    private readonly uiService: UiService
  ) {
  }

  ngOnInit() {
    this.store.pipe(
      select(PlaceTypeSelectors.Selected),
      filter(placeType => !isNil(placeType)),
      take(1)
    ).subscribe(placeType => {
      this.placeType = cloneDeep(placeType);
      if (this.placeType.id) {
        this.uiService.setPageTitle('page.placeType.editTitle');
      } else {
        this.uiService.setPageTitle('page.placeType.createTitle');
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

  onCancel() {
    this.router.navigateByUrl(PLACE_TYPES);
  }

  onSave() {
    if (this.placeType.id) {
      this.store.dispatch(PlaceTypeActions.update({payload: this.placeType}));
    } else {
      this.store.dispatch(PlaceTypeActions.create({payload: this.placeType}));
    }
  }

  placeTypeChanged($event: PlaceTypeDto) {
    this.placeType = { ...this.placeType, ...$event };
  }
}
