import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignNewRevisionComponent } from './assign-new-revision.component';

describe('AssignNewRevisionComponent', () => {
  let component: AssignNewRevisionComponent;
  let fixture: ComponentFixture<AssignNewRevisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignNewRevisionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignNewRevisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
