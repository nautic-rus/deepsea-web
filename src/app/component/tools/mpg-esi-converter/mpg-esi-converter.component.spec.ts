import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpgEsiConverterComponent } from './mpg-esi-converter.component';

describe('MpgEsiConverterComponent', () => {
  let component: MpgEsiConverterComponent;
  let fixture: ComponentFixture<MpgEsiConverterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MpgEsiConverterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MpgEsiConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
