import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebgcodeComponent } from './webgcode.component';

describe('WebgcodeComponent', () => {
  let component: WebgcodeComponent;
  let fixture: ComponentFixture<WebgcodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebgcodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebgcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
