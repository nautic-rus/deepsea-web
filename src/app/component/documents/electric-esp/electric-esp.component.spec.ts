import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectricEspComponent } from './electric-esp.component';

describe('ElectricEspComponent', () => {
  let component: ElectricEspComponent;
  let fixture: ComponentFixture<ElectricEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElectricEspComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectricEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
