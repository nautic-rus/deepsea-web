import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationEspComponent } from './accommodation-esp.component';

describe('AccommodationEspComponent', () => {
  let component: AccommodationEspComponent;
  let fixture: ComponentFixture<AccommodationEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccommodationEspComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccommodationEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
