import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.services';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css'],
})
export class MaintenanceComponent {
  maintenanceData: any = {
    apartment_id: '',
    landlord_id: '',
    start_date: '',
    end_date: '',
    description: '',
    expenses: 0,
  };
  apartments: any[] = [];
  maintenanceList: any[] = []; // Property to hold fetched maintenance tasks

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      console.log('Token:', token);
      this.getUserProfile();
      this.getApartments();
      this.getMaintenance(); // Fetch maintenance tasks when component initializes
    } else {
      console.warn('Token not found, user is not logged in');
    }
  }

  getUserProfile() {
    const userProfile = this.authService.getUserProfileFromToken();
    if (userProfile) {
      console.log('User profile:', userProfile);
      // Assuming `id` is the user ID (landlord ID)
      this.maintenanceData.landlord_id = userProfile.id;
    }
  }

  getApartments() {
    this.authService.getApartments().subscribe(
      (response) => {
        console.log('Apartments fetched:', response);
        this.apartments = response;
      },
      (error) => {
        console.error('Error fetching apartments:', error);
      }
    );
  }


 // Method to fetch maintenance tasks
getMaintenance(): void {
  this.authService.getMaintenance().subscribe(
    (response) => {
      console.log('Maintenance tasks fetched:', response);
      this.maintenanceList = response.data; // Access the 'data' property that contains the maintenance tasks
    },
    (error) => {
      console.error('Error fetching maintenance tasks:', error);
    }
  );
}

// Method to find apartment by ID
getApartmentById(apartmentId: number) {
  return this.apartments.find(apartment => apartment.apartment_id === apartmentId);
}


  // Method to submit new maintenance task
  onSubmit(): void {
    this.authService.addMaintenance(this.maintenanceData).subscribe(
      (response) => {
        console.log('Maintenance added successfully:', response);
        alert('Maintenance task added successfully!');
        this.getMaintenance(); // Refresh the list of maintenance tasks after adding
      },
      (error) => {
        console.error('Error adding maintenance:', error);
        alert('Failed to add maintenance task. Please try again.');
      }
    );
  }
}
