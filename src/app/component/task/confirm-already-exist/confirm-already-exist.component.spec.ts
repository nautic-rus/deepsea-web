import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmAlreadyExistComponent } from './confirm-already-exist.component';

describe('ConfirmAlreadyExistComponent', () => {
  let component: ConfirmAlreadyExistComponent;
  let fixture: ComponentFixture<ConfirmAlreadyExistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmAlreadyExistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmAlreadyExistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
