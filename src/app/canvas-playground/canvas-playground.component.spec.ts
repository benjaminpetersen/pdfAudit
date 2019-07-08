import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasPlaygroundComponent } from './canvas-playground.component';

describe('CanvasPlaygroundComponent', () => {
  let component: CanvasPlaygroundComponent;
  let fixture: ComponentFixture<CanvasPlaygroundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanvasPlaygroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasPlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
