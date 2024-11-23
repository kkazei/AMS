import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandlordRoomComponent } from './landlord-room.component';

describe('LandlordRoomComponent', () => {
  let component: LandlordRoomComponent;
  let fixture: ComponentFixture<LandlordRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandlordRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandlordRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
