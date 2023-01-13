import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignResponsibleComponent } from './assign-responsible.component';

describe('AssignResponsibleComponent', () => {
  let component: AssignResponsibleComponent;
  let fixture: ComponentFixture<AssignResponsibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignResponsibleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignResponsibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
