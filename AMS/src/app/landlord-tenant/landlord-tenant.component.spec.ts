import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandlordTenantComponent } from './landlord-tenant.component';

describe('LandlordTenantComponent', () => {
  let component: LandlordTenantComponent;
  let fixture: ComponentFixture<LandlordTenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandlordTenantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandlordTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
