import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddComplectComponent } from './add-complect.component';

describe('AddComplectComponent', () => {
  let component: AddComplectComponent;
  let fixture: ComponentFixture<AddComplectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddComplectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddComplectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
