import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareExcelStatementsComponent } from './compare-excel-statements.component';

describe('CompareExcelStatementsComponent', () => {
  let component: CompareExcelStatementsComponent;
  let fixture: ComponentFixture<CompareExcelStatementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompareExcelStatementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareExcelStatementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
