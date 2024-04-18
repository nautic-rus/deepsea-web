import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseFullComponent } from './warehouse-full.component';

describe('WarehouseFullComponent', () => {
  let component: WarehouseFullComponent;
  let fixture: ComponentFixture<WarehouseFullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseFullComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
