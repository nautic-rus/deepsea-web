import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmAlreadyExistSendToApprovalComponent } from './confirm-already-exist-send-to-approval.component';

describe('ConfirmAlreadyExistSendToApprovalComponent', () => {
  let component: ConfirmAlreadyExistSendToApprovalComponent;
  let fixture: ComponentFixture<ConfirmAlreadyExistSendToApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmAlreadyExistSendToApprovalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmAlreadyExistSendToApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
