import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddComplectToEspComponent } from './add-complect-to-esp.component';

describe('AddComplectToEspComponent', () => {
  let component: AddComplectToEspComponent;
  let fixture: ComponentFixture<AddComplectToEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddComplectToEspComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddComplectToEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
