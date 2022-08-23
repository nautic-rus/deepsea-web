import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMaterialToEspComponent } from './add-material-to-esp.component';

describe('AddMaterialToEspComponent', () => {
  let component: AddMaterialToEspComponent;
  let fixture: ComponentFixture<AddMaterialToEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMaterialToEspComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMaterialToEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
