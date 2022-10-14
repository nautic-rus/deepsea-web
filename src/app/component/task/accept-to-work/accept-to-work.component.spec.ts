import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptToWorkComponent } from './accept-to-work.component';

describe('AcceptToWorkComponent', () => {
  let component: AcceptToWorkComponent;
  let fixture: ComponentFixture<AcceptToWorkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceptToWorkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptToWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
