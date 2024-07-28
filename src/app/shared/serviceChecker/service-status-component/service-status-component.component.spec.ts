import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceStatusComponentComponent } from './service-status-component.component';

describe('ServiceStatusComponentComponent', () => {
  let component: ServiceStatusComponentComponent;
  let fixture: ComponentFixture<ServiceStatusComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceStatusComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceStatusComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
