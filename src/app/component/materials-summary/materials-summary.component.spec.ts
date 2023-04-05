import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialsSummaryComponent } from './materials-summary.component';

describe('MaterialsSummaryComponent', () => {
  let component: MaterialsSummaryComponent;
  let fixture: ComponentFixture<MaterialsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialsSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
