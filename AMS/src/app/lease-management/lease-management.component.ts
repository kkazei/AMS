import { Component } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lease-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './lease-management.component.html',
  styleUrl: './lease-management.component.css'
})
export class LeaseManagementComponent {
  userProfile: any;
  selectedFile: File | null = null; // Store the selected file
  preview: string = ''; // For previewing the file
  message = ''; // Message to show the status of the upload
  tenants: any[] = []; // Store the list of tenants
  selectedTenant: any = null; // Store the selected tenant's details
  leaseImages: any[] = []; // Store the list of lease images for the selected tenant

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      this.getTenants(); // Fetch tenants from API
    } else {
      console.warn('Token not found, user is not logged in');
    }
  }

  // Fetch tenants with room details from the API
  getTenants() {
    this.authService.getTenants().subscribe(
      (response) => {
        if (Array.isArray(response)) {
          this.tenants = response;
        } else {
          console.error('Unexpected response format:', response);
          this.tenants = [];
        }
      },
      (error) => {
        console.error('Error fetching tenants:', error);
      }
    );
  }

  // Select a tenant to view their details
  selectTenant(tenant: any) {
    this.selectedTenant = tenant;
    this.loadLeaseImages(); // Load lease images for the selected tenant
  }

  // Fetch lease images for the selected tenant
  loadLeaseImages() {
    if (this.selectedTenant) {
      const tenantId = this.selectedTenant.tenant_id; // Get the selected tenant's ID
      this.authService.loadLease(tenantId).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            // Filter the images based on the tenant ID to make sure we only display images for the selected tenant
            this.leaseImages = response.data
              .filter((image: any) => image.tenant_id === tenantId) // Ensure the tenant_id matches
              .map((image: any) => {
                return {
                  ...image,
                  img: `http://localhost/amsAPI/api/${image.img}` // Adjust path as needed
                };
              });
          } else {
            console.error('Failed to retrieve images:', response.message);
          }
        },
        (error) => {
          console.error('Error fetching images:', error);
        }
      );
    }
  }
  
  

  // Handle file selection
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.preview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Upload the selected file for the selected tenant
  upload() {
    if (this.selectedFile && this.selectedTenant) {
      const tenantId = this.selectedTenant.tenant_id;
      const room = this.selectedTenant.room;
      this.authService.addLease(this.selectedFile, tenantId, room).subscribe(
        (response) => {
          this.message = 'Lease uploaded successfully!';
          this.loadLeaseImages(); // Reload the lease images after successful upload
        },
        (error) => {
          this.message = 'Lease upload failed!';
          console.error('Error uploading lease:', error);
        }
      );
    } else {
      this.message = 'Please select a tenant and file before uploading!';
    }
  }

  // Track tenants in the grid using a unique identifier
  trackByFn(index: number, item: any) {
    return item.tenant_id;
  }
}