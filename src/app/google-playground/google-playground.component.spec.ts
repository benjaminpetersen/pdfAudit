import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GooglePlaygroundComponent } from './google-playground.component';

describe('GooglePlaygroundComponent', () => {
  let component: GooglePlaygroundComponent;
  let fixture: ComponentFixture<GooglePlaygroundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GooglePlaygroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GooglePlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
