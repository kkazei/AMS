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
  imageInfos: any[] = []; // Store the list of lease images
  message = ''; // Message to show the status of the upload
  tenantId: number | null = null; // Store the selected tenant ID
  room: string = ''; // Store the selected room
  tenants: any[] = []; // Store the list of tenants from the API
  apartments: any[] = []; // Store the list of apartments (rooms)
  selectedTenant: any = null; // Store the selected tenant's details

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);

      this.getTenants(); // Fetch tenants from API
      this.getApartments(); // Fetch apartments from API
      this.loadImages(); // Load previously uploaded images
    } else {
      console.warn('Token not found, user is not logged in');
    }
  }

  // Fetch the list of tenants from the API
  getTenants() {
    this.authService.getTenants().subscribe(
      (response) => {
        console.log('Tenants fetched:', response);
        if (Array.isArray(response)) {
          this.tenants = response;
        } else {
          console.error('Unexpected response format:', response);
          this.tenants = [];
        }
      },
      (error) => {
        console.error('Error fetching tenants:', error);
        this.tenants = [];
      }
    );
  }

  // Fetch the list of apartments (rooms) from the API
  getApartments() {
    this.authService.getApartments().subscribe(
      (response) => {
        console.log('Apartments fetched:', response);
        if (Array.isArray(response)) {
          this.apartments = response;
        } else {
          console.error('Unexpected response format:', response);
          this.apartments = [];
        }
      },
      (error) => {
        console.error('Error fetching apartments:', error);
        this.apartments = [];
      }
    );
  }

  // Handle tenant selection
  onTenantSelect() {
    this.selectedTenant = this.tenants.find((tenant) => tenant.tenant_id === this.tenantId);
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

  // Fetch previously uploaded images (leases)
  loadImages() {
    this.authService.loadLease().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.imageInfos = response.data.map((image: any) => {
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

  // Upload the selected file along with tenant ID and room
  upload() {
    if (this.selectedFile && this.tenantId && this.room) {
      this.authService.addLease(this.selectedFile, this.tenantId, this.room).subscribe(
        (response) => {
          console.log(response);
          this.message = 'Lease uploaded successfully!';
          this.loadImages(); // Refresh the list of images
        },
        (error) => {
          console.error(error);
          this.message = 'Lease upload failed!';
        }
      );
    } else {
      this.message = 'Please select a file and ensure tenant ID and room are set!';
    }
  }

  // Track images in the list using a unique identifier
  trackByFn(index: number, item: any) {
    return item.imgName;
  }
}
