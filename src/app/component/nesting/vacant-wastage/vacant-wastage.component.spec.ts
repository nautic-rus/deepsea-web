import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacantWastageComponent } from './vacant-wastage.component';

describe('VacantWastageComponent', () => {
  let component: VacantWastageComponent;
  let fixture: ComponentFixture<VacantWastageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VacantWastageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VacantWastageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
