import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialComplectManagerComponent } from './material-complect-manager.component';

describe('MaterialComplectManagerComponent', () => {
  let component: MaterialComplectManagerComponent;
  let fixture: ComponentFixture<MaterialComplectManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialComplectManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialComplectManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
