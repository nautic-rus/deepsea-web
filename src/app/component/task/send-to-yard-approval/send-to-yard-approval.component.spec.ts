import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendToYardApprovalComponent } from './send-to-yard-approval.component';

describe('SendToYardApprovalComponent', () => {
  let component: SendToYardApprovalComponent;
  let fixture: ComponentFixture<SendToYardApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendToYardApprovalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendToYardApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
