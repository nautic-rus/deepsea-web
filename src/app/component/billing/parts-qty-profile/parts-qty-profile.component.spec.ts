import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartsQtyProfileComponent } from './parts-qty-profile.component';

describe('PartsQtyProfileComponent', () => {
  let component: PartsQtyProfileComponent;
  let fixture: ComponentFixture<PartsQtyProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartsQtyProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartsQtyProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
