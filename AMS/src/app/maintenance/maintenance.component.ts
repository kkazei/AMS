import Swal from 'sweetalert2';
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
  newMaintenanceData: any = {
    apartment_id: '',
    landlord_id: '',
    start_date: '',
    end_date: '',
    description: '',
    expenses: 0,
    status: 'pending' // Default status
  };
  editMaintenanceData: any = {
    maintenance_id: null,
    apartment_id: '',
    landlord_id: '',
    start_date: '',
    end_date: '',
    description: '',
    expenses: 0,
    status: 'pending' // Default status
    
  };
  apartments: any[] = [];
  maintenanceList: any[] = []; // Property to hold fetched maintenance tasks
  editMode: boolean = false; // Flag to toggle edit mode

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
      this.newMaintenanceData.landlord_id = userProfile.id;
      this.editMaintenanceData.landlord_id = userProfile.id;
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
  onAddSubmit(): void {
    this.authService.addMaintenance(this.newMaintenanceData).subscribe(
      (response) => {
        console.log('Maintenance added successfully:', response);
        
        Swal.fire({
          icon: 'success',
          title: 'Maintenance Added',
          text: 'The maintenance task has been added successfully!',
        }).then(() => {
          this.getMaintenance(); // Refresh the list of maintenance tasks after adding
          this.resetNewMaintenanceData(); // Reset the form
        });
      },
      (error) => {
        console.error('Error adding maintenance:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Add Failed',
          text: 'Failed to add maintenance task. Please try again.',
        });
      }
    );
  }
  

  // Method to submit updated maintenance task
  onEditSubmit(): void {
    this.authService.updateMaintenance(this.editMaintenanceData).subscribe(
      (response) => {
        console.log('Maintenance updated successfully:', response);
        
        Swal.fire({
          icon: 'success',
          title: 'Maintenance Updated',
          text: 'The maintenance task has been updated successfully!',
        }).then(() => {
          this.getMaintenance(); // Refresh the list of maintenance tasks after updating
          this.cancelEdit(); // Exit edit mode
        });
      },
      (error) => {
        console.error('Error updating maintenance:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Failed to update maintenance task. Please try again.',
        });
      }
    );
  }
  

  // Method to edit a maintenance task
  editMaintenance(maintenance: any): void {
    this.editMaintenanceData = { ...maintenance }; // Copy the maintenance task data to the form
    this.editMode = true; // Enable edit mode
  }

  // Method to cancel edit mode
  cancelEdit(): void {
    this.editMode = false; // Disable edit mode
    this.resetEditMaintenanceData(); // Reset the edit form
  }

  // Method to reset new maintenance data form
  resetNewMaintenanceData(): void {
    this.newMaintenanceData = {
      apartment_id: '',
      landlord_id: this.newMaintenanceData.landlord_id, // Preserve landlord_id
      start_date: '',
      end_date: '',
      description: '',
      expenses: 0,
      status: 'pending' // Default status
    };
  }

  // Method to reset edit maintenance data form
  resetEditMaintenanceData(): void {
    this.editMaintenanceData = {
      maintenance_id: null,
      apartment_id: '',
      landlord_id: this.editMaintenanceData.landlord_id, // Preserve landlord_id
      start_date: '',
      end_date: '',
      description: '',
      expenses: 0,
      status: 'pending' // Default status
    };
  }

  archiveMaintenance(maintenanceId: number): void {
    this.authService.archiveMaintenance(maintenanceId).then(
      (response) => {
        console.log('Maintenance task archived successfully:', response);
        
        Swal.fire({
          icon: 'success',
          title: 'Maintenance Archived',
          text: 'The maintenance task has been archived successfully!',
        }).then(() => {
          this.getMaintenance(); // Refresh the list of maintenance tasks
        });
      }
    ).catch((error) => {
      console.error('Error archiving maintenance task:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Archive Failed',
        text: 'Failed to archive the maintenance task. Please try again.',
      });
    });
  }
}