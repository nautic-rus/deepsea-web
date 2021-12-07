import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocMComponent } from './doc-m.component';

describe('DocMComponent', () => {
  let component: DocMComponent;
  let fixture: ComponentFixture<DocMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocMComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
