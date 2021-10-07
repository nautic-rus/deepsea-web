import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendToCloudComponent } from './send-to-cloud.component';

describe('SendToCloudComponent', () => {
  let component: SendToCloudComponent;
  let fixture: ComponentFixture<SendToCloudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendToCloudComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendToCloudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
