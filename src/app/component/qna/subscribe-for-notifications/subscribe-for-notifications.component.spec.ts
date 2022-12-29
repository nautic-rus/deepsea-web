import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribeForNotificationsComponent } from './subscribe-for-notifications.component';

describe('SubscribeForNotificationsComponent', () => {
  let component: SubscribeForNotificationsComponent;
  let fixture: ComponentFixture<SubscribeForNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscribeForNotificationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscribeForNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
