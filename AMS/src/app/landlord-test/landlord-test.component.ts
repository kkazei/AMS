import { Component } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-landlord-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landlord-test.component.html',
  styleUrl: './landlord-test.component.css'
})
export class LandlordTestComponent {
  userProfile: any;
  tenants: any[] = [];
  selectedApartmentId: number | null = null;
  selectedTenantId: number | null = null;
  isCollapsed = false;
  TotalIncome = 0;
  apartments: any[] = [];
  message: string = '';

  title: string = '';
  content: string = '';
  room: string = '';
  rent: number = 0;
  description: string = '';

  posts: any[] = [];

  selectedFile: File | null = null; // Add this line
  preview: string = '';
  imageInfos: any[] = [];
  paymentTenantId: string | null = null;
  paymentAmount: number | null = null;
  paymentReferenceNumber: string = '';
  paymentProofOfPayment: File | null = null;
  paymentMessage: string = '';
  paymentDetails: any = null; // Add this line
  manualTenantEntry: boolean = false;
manualTenantName: string = '';
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);

      this.getApartments();
      this.getTenants();
  
    } else {
      console.warn('Token not found, user is not logged in');
    }
  }
    openTenantModal(){
      const modal = document.getElementById("TenantModal")
      if(modal != null){
        modal.style.display = "block";
      }
    }
    closeTenantModal(){
      const modal = document.getElementById("TenantModal")
      if(modal != null){
        modal.style.display = "none";
      }
    }

    getTenants() {
      this.authService.getTenants().subscribe(
        (response) => {
          console.log('Tenants fetched:', response);
          // Directly assign response to tenants if it's an array
          if (Array.isArray(response)) {
            this.tenants = response;  // No need for a 'data' check here
          } else {
            console.error('Unexpected response format:', response);
            this.tenants = [];  // Reset to empty array in case of error
          }
          console.log('Tenants array:', this.tenants); // Log to verify
        },
        (error) => {
          console.error('Error fetching tenants:', error);
          this.tenants = [];  // Reset to empty array in case of error
        }
      );
    }
    getApartments(): void {
      this.authService.getApartments().subscribe(
        (response) => {
          this.apartments = response;
        },
        (error) => console.error('Error fetching apartments:', error)
      );
    }

    assignTenantToApartment() {
      if (!this.selectedApartmentId || !this.selectedTenantId) {
        console.error('Apartment and Tenant selection is required');
        this.message = 'Please select both an apartment and a tenant.';
        return;
      }
  
      const assignmentData = {
        apartment_id: this.selectedApartmentId,
        tenant_id: this.selectedTenantId,
      };
  
      this.authService.assignTenantToApartment(assignmentData).subscribe(
        (response) => {
          console.log('Tenant assigned successfully:', response);
          this.message = 'Tenant assigned successfully!';
          this.getApartments(); // Refresh the apartments after assignment
        },
        (error) => {
          console.error('Error assigning tenant:', error);
          this.message = 'Failed to assign tenant.';
        }
      );
    }
  
  

    updateApartmentAndTenant(action: string) {
      if (!this.selectedApartmentId) {
        Swal.fire({
          icon: 'warning',
          title: 'Apartment Selection Required',
          text: 'Please select an apartment to proceed.',
        });
        return;
      }
    
      if (action === 'remove_tenant') {
        if (!this.selectedTenantId) {
          Swal.fire({
            icon: 'warning',
            title: 'Tenant Selection Required',
            text: 'Please select a tenant to remove.',
          });
          return;
        }
    
        const updateData: any = {
          apartment_id: this.selectedApartmentId,
          action: action,
          tenant_id: this.selectedTenantId,
        };
    
        this.authService.updateApartmentAndTenant(updateData).subscribe(
          (response) => {
            console.log('Tenant removed successfully:', response);
            Swal.fire({
              icon: 'success',
              title: 'Tenant Removed',
              text: 'The tenant has been removed successfully!',
            }).then(() => {
              this.getApartments(); // Refresh apartments
              this.getTenants();   // Refresh tenants
            });
          },
          (error) => {
            console.error('Error removing tenant:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error Removing Tenant',
              text: 'Failed to remove the tenant. Please try again later.',
            });
          }
        );
      } else if (action === 'assign_tenant') {
        if (!this.selectedTenantId) {
          Swal.fire({
            icon: 'warning',
            title: 'Tenant Selection Required',
            text: 'Please select a tenant to assign.',
          });
          return;
        }
    
        const assignmentData: any = {
          apartment_id: this.selectedApartmentId,
          tenant_id: this.selectedTenantId,
        };
    
        this.authService.assignTenantToApartment(assignmentData).subscribe(
          (response) => {
            console.log('Tenant assigned successfully:', response);
            Swal.fire({
              icon: 'success',
              title: 'Tenant Assigned',
              text: 'The tenant has been assigned successfully!',
            }).then(() => {
              this.getApartments();                // Refresh apartments
              this.getTenants();                   // Refresh tenants
            });
          },
          (error) => {
            console.error('Error assigning tenant:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error Assigning Tenant',
              text: 'Failed to assign the tenant. Please try again later.',
            });
          }
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Action',
          text: 'The specified action is not valid.',
        });
      }
    }
    

    checkTenantAssignment(): void {
      const selectedTenant = this.tenants.find(tenant => tenant.tenant_id === this.selectedTenantId);
      
      if (selectedTenant && selectedTenant.room) {
        Swal.fire({
          icon: 'info',
          title: 'Tenant Already Assigned',
          text: `This tenant is already assigned to apartment: ${selectedTenant.room}`,
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Tenant Not Assigned',
          text: 'This tenant is not currently assigned to any apartment.',
        });
      }
    }

    deleteTenant(tenantId: number): void {
      // Show confirmation modal
      Swal.fire({
        icon: 'warning',
        title: 'Delete Tenant?',
        text: 'Are you sure you want to delete this tenant? This action cannot be undone.',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          // Proceed with deletion
          this.authService.deleteTenant(tenantId).subscribe(
            (response) => {
              if (response.status === 'success') {
                Swal.fire({
                  icon: 'success',
                  title: 'Deleted',
                  text: 'The tenant has been successfully deleted.',
                }).then(() => {
                  // Remove the tenant from the list
                  this.tenants = this.tenants.filter(tenant => tenant.tenant_id !== tenantId);
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Deletion Failed',
                  text: response.message || 'An error occurred while trying to delete the tenant.',
                });
              }
            },
            (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete the tenant. Please try again later.',
              });
              console.error('Error deleting tenant:', error);
            }
          );
        }
      });
    }
}
