import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.services';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [MatIconModule, DatePipe],
  templateUrl: './tenant-dashboard.component.html',
  styleUrls: ['./tenant-dashboard.component.css']
})
export class TenantDashboardComponent implements OnInit {
  userProfile: any;
  room: string = '';
  rent: number = 0;
  tenants: any[] = [];
  tenant: any = {}; 
  currentDate: Date = new Date(); 


  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);
      this.fetchData(); // Fetch tenants and match data
    } else {
      console.warn('Token not found, user is not logged in');
    }
  }
  

  fetchData(): void {
    this.getCurrentTenant();
  }

  getCurrentTenant(): void {
    this.authService.getTenants().subscribe(
      (response) => {
        if (Array.isArray(response)) {
          this.tenant = response.find((tenant) => tenant.tenant_email === this.userProfile.email);
          console.log('Current tenant:', this.tenant);
        }
      },
      (error) => {
        console.error('Error fetching tenants:', error);
      }
    );
  }
  
}
