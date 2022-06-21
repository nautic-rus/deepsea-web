import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingPipeComponent } from './billing-pipe.component';

describe('BillingPipeComponent', () => {
  let component: BillingPipeComponent;
  let fixture: ComponentFixture<BillingPipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingPipeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingPipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
