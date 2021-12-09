import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaborCostsComponent } from './labor-costs.component';

describe('LaborCostsComponent', () => {
  let component: LaborCostsComponent;
  let fixture: ComponentFixture<LaborCostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaborCostsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaborCostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
