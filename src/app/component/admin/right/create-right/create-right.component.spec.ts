import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRightComponent } from './create-right.component';

describe('CreateRightComponent', () => {
  let component: CreateRightComponent;
  let fixture: ComponentFixture<CreateRightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateRightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
