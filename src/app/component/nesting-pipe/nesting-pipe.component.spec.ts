import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NestingPipeComponent } from './nesting-pipe.component';

describe('NestingPipeComponent', () => {
  let component: NestingPipeComponent;
  let fixture: ComponentFixture<NestingPipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NestingPipeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NestingPipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
