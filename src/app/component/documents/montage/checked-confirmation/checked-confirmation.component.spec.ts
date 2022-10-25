import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckedConfirmationComponent } from './checked-confirmation.component';

describe('CheckedConfirmationComponent', () => {
  let component: CheckedConfirmationComponent;
  let fixture: ComponentFixture<CheckedConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckedConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckedConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
