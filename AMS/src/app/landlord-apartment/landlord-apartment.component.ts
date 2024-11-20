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
    } else {
      console.warn('Token not found, user is not logged in');
    }
  }

  getPosts() {
    this.authService.getPosts().subscribe(
      (response) => {
        console.log('Posts fetched:', response);
        this.posts = response;
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
  
  
  
  

  createPost() {
    const postData = {
      title: this.title.trim() || 'Untitled Post',
      content: this.content.trim(),
      landlord_id: this.userProfile.id,
    };

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
}
