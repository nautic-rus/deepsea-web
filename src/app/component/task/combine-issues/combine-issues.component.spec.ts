import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombineIssuesComponent } from './combine-issues.component';

describe('CombineIssuesComponent', () => {
  let component: CombineIssuesComponent;
  let fixture: ComponentFixture<CombineIssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CombineIssuesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CombineIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
