import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportxlsComponent } from './importxls.component';

describe('ImportxlsComponent', () => {
  let component: ImportxlsComponent;
  let fixture: ComponentFixture<ImportxlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportxlsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportxlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
