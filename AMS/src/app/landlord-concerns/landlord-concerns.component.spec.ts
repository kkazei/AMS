import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandlordConcernsComponent } from './landlord-concerns.component';

describe('LandlordConcernsComponent', () => {
  let component: LandlordConcernsComponent;
  let fixture: ComponentFixture<LandlordConcernsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandlordConcernsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandlordConcernsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
