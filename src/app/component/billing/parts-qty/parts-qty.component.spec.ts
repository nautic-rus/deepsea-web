import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartsQtyComponent } from './parts-qty.component';

describe('PartsQtyComponent', () => {
  let component: PartsQtyComponent;
  let fixture: ComponentFixture<PartsQtyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartsQtyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartsQtyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
