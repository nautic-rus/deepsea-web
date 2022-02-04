import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElecCablesComponent } from './elec-cables.component';

describe('ElecCablesComponent', () => {
  let component: ElecCablesComponent;
  let fixture: ComponentFixture<ElecCablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElecCablesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElecCablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
