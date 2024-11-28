import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landlord-apartment',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './landlord-apartment.component.html',
  styleUrls: ['./landlord-apartment.component.css'],
})
export class LandlordApartmentComponent implements OnInit {
  userProfile: any;
  title: string = '';
  content: string = '';
  room: string = '';
  rent: number = 0;
  description: string = '';
  message: string = '';
  posts: any[] = [];
  apartments: any[] = [];
  tenants: any[] = [];
  selectedApartmentId: number | null = null;
  selectedTenantId: number | null = null;
  selectedFile: File | null = null; // Add this line
  preview: string = '';
  imageInfos: any[] = [];


  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);

      this.getPosts();
      this.getApartments();
      this.getTenants();
      this.loadImages(); // Call the new method to load images
    } else {
      console.warn('Token not found, user is not logged in');
    }
  }

  getPosts() {
    this.authService.getPosts().subscribe(
      (response: any[]) => {
        console.log('Posts fetched:', response);
        this.posts = response.map(post => {
          return {
            ...post,
            image_path: `http://localhost/amsAPI/api/${post.image_path}` // Adjust the base URL as needed
          };
        });
        console.log('Posts with updated image paths:', this.posts);
      },
      (error) => {
        console.error('Error fetching posts:', error);
      }
    );
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

  loadImages() {
    this.authService.loadImage().subscribe(
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
          // Handle error message or fallback as needed
        }
      },
      (error) => {
        console.error('Error fetching images:', error);
        // Handle error as needed
      }
    );
  }  

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.preview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  upload() {
    if (this.selectedFile) {
      this.authService.addImage(this.selectedFile).subscribe(
        (response) => {
          console.log(response);
          this.message = 'File uploaded successfully!';
          this.loadImages(); // Refresh the list of images
        },
        (error) => {
          console.error(error);
          this.message = 'File upload failed!';
        }
      );
    }
  }

  trackByFn(index: number, item: any) {
    return item.imgName; // Use a unique identifier for each item
  }

 createPost() {
  const postData = new FormData();
  postData.append('title', this.title.trim() || 'Untitled Post');
  postData.append('content', this.content.trim());
  postData.append('landlord_id', this.userProfile.id.toString());

  if (this.selectedFile) {
    postData.append('image', this.selectedFile, this.selectedFile.name);
  }

  this.authService.createAnnouncement(postData).subscribe(
    (response) => {
      console.log('Post created successfully:', response);
      this.message = 'Post created successfully!';
      this.getPosts();
    },
    (error) => {
      console.error('Error creating post:', error);
      this.message = 'Failed to create post.';
    }
  );
}


  createApartment() {
    const apartmentData = {
      room: this.room.trim(),
      rent: this.rent,
      description: this.description.trim(),
      landlord_id: this.userProfile.id,
    };

    this.authService.createApartment(apartmentData).subscribe(
      (response) => {
        console.log('Apartment created successfully:', response);
        this.message = 'Apartment created successfully!';
        this.getApartments();
      },
      (error) => {
        console.error('Error creating apartment:', error);
        this.message = 'Failed to create apartment.';
      }
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

  // Updated method to handle only 'remove_tenant'
  updateApartmentAndTenant(action: string) {
    if (!this.selectedApartmentId) {
      console.error('Apartment selection is required');
      this.message = 'Please select an apartment.';
      return;
    }
  
    // Handle 'remove_tenant' action
    if (action === 'remove_tenant') {
      if (!this.selectedTenantId) {
        console.error('Tenant selection is required for removal');
        this.message = 'Please select a tenant for removal.';
        return;
      }
  
      const updateData: any = {
        apartment_id: this.selectedApartmentId,
        action: action,
        tenant_id: this.selectedTenantId,  // Include tenant_id for removal
      };
  
      this.authService.updateApartmentAndTenant(updateData).subscribe(
        (response) => {
          console.log('Tenant removed successfully:', response);
          this.message = 'Tenant removed successfully!';
          this.getApartments(); // Refresh the apartments after removal
          this.getTenants(); // Refresh tenants to reflect changes
        },
        (error) => {
          console.error('Error removing tenant:', error);
          this.message = 'Failed to remove tenant.';
        }
      );
    }
    // Handle 'assign_tenant' action
    else if (action === 'assign_tenant') {
      if (!this.selectedTenantId) {
        console.error('Tenant selection is required for assignment');
        this.message = 'Please select a tenant for assignment.';
        return;
      }
  
      const assignmentData: any = {
        apartment_id: this.selectedApartmentId,
        tenant_id: this.selectedTenantId,  // Include tenant_id for assignment
      };
  
      this.authService.assignTenantToApartment(assignmentData).subscribe(
        (response) => {
          console.log('Tenant assigned successfully:', response);
          this.message = 'Tenant assigned successfully!';
          this.getApartments(); // Refresh the apartments after assignment
          this.getTenants(); // Refresh tenants to reflect changes
        },
        (error) => {
          console.error('Error assigning tenant:', error);
          this.message = 'Failed to assign tenant.';
        }
      );
    } else {
      console.error('Invalid action:', action);
      this.message = 'Invalid action specified.';
    }
  }
  
}
