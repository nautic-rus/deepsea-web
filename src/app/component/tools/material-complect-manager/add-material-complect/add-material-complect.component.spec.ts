import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMaterialComplectComponent } from './add-material-complect.component';

describe('AddMaterialComplectComponent', () => {
  let component: AddMaterialComplectComponent;
  let fixture: ComponentFixture<AddMaterialComplectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMaterialComplectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMaterialComplectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
