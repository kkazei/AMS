import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandlordAnouncementComponent } from './landlord-anouncement.component';

describe('LandlordAnouncementComponent', () => {
  let component: LandlordAnouncementComponent;
  let fixture: ComponentFixture<LandlordAnouncementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandlordAnouncementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandlordAnouncementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
