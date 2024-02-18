import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPlaceConnectionComponent } from './select-place-connection.component';

describe('SelectPlaceConnectionComponent', () => {
  let component: SelectPlaceConnectionComponent;
  let fixture: ComponentFixture<SelectPlaceConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectPlaceConnectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectPlaceConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
