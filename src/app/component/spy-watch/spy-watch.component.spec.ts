import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpyWatchComponent } from './spy-watch.component';

describe('SpyWatchComponent', () => {
  let component: SpyWatchComponent;
  let fixture: ComponentFixture<SpyWatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpyWatchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpyWatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
