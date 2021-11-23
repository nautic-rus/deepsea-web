import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmAlreadyExistSendToYardComponent } from './confirm-already-exist-send-to-yard.component';

describe('ConfirmAlreadyExistSendToYardComponent', () => {
  let component: ConfirmAlreadyExistSendToYardComponent;
  let fixture: ComponentFixture<ConfirmAlreadyExistSendToYardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmAlreadyExistSendToYardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmAlreadyExistSendToYardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
