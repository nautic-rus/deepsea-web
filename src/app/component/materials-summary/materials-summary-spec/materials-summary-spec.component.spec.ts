import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialsSummarySpecComponent } from './materials-summary-spec.component';

describe('MaterialsSummarySpecComponent', () => {
  let component: MaterialsSummarySpecComponent;
  let fixture: ComponentFixture<MaterialsSummarySpecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialsSummarySpecComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialsSummarySpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
