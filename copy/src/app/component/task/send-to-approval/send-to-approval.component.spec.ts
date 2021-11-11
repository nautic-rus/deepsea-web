import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendToApprovalComponent } from './send-to-approval.component';

describe('SendToApprovalComponent', () => {
  let component: SendToApprovalComponent;
  let fixture: ComponentFixture<SendToApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendToApprovalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendToApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
