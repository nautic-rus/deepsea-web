import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeResponsibleComponent } from './change-responsible.component';

describe('ChangeResponsibleComponent', () => {
  let component: ChangeResponsibleComponent;
  let fixture: ComponentFixture<ChangeResponsibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeResponsibleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeResponsibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
