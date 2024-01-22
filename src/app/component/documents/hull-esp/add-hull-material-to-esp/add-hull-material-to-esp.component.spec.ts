import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHullMaterialToEspComponent } from './add-hull-material-to-esp.component';

describe('AddHullMaterialToEspComponent', () => {
  let component: AddHullMaterialToEspComponent;
  let fixture: ComponentFixture<AddHullMaterialToEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddHullMaterialToEspComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddHullMaterialToEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
