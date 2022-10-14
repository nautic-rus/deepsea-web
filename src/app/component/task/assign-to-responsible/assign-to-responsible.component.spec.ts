import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignToResponsibleComponent } from './assign-to-responsible.component';

describe('AssignToResponsibleComponent', () => {
  let component: AssignToResponsibleComponent;
  let fixture: ComponentFixture<AssignToResponsibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignToResponsibleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignToResponsibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
