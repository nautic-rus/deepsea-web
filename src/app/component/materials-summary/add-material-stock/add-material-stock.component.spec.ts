import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMaterialStockComponent } from './add-material-stock.component';

describe('AddMaterialStockComponent', () => {
  let component: AddMaterialStockComponent;
  let fixture: ComponentFixture<AddMaterialStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMaterialStockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMaterialStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
