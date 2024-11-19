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

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token); // Log token
      console.log('User profile:', this.userProfile); // Log userProfile

      this.getPosts();
      this.getApartments();
    } else {
      console.warn('Token not found, user is not logged in');
    }
  }

  getPosts() {
    this.authService.getPosts().subscribe(
      (response) => {
        console.log('Posts fetched:', response);
        this.posts = response;  // Assign the response to the posts array
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
        this.apartments = response;  // Assign the response to the apartments array
      },
      (error) => {
        console.error('Error fetching apartments:', error);
      }
    );
  }

  createPost() {
    if (!this.title.trim()) {
      this.title = 'Untitled Post';
    }
    if (!this.content.trim()) {
      console.error('Post content is required');
      return;
    }

    const postData = {
      title: this.title,
      content: this.content,
      landlord_id: this.userProfile.id, // Assuming 'id' is part of userProfile
    };

    this.authService.createAnnouncement(postData).subscribe(
      (response) => {
        console.log('Post created successfully:', response);
        this.message = 'Post created successfully!';
        this.getPosts();  // Refresh the posts after creation
      },
      (error) => {
        console.error('Error creating post:', error);
        this.message = 'Failed to create post.';
      }
    );
  }

  createApartment() {
    // Log the values to verify they are set correctly
    console.log('Room:', this.room);
    console.log('Rent:', this.rent);
    console.log('Description:', this.description);

    if (!this.room.trim() || !this.rent || !this.description.trim()) {
      console.error('All fields are required');
      return;
    }

    const apartmentData = {
      room: this.room,
      rent: this.rent,
      description: this.description,
      landlord_id: this.userProfile.id, // Assuming 'id' is part of userProfile
    };

    this.authService.createApartment(apartmentData).subscribe(
      (response) => {
        console.log('Apartment created successfully:', response);
        this.message = 'Apartment created successfully!';
        this.getApartments();  // Refresh the apartments after creation
      },
      (error) => {
        console.error('Error creating apartment:', error);
        this.message = 'Failed to create apartment.';
      }
    );
  }
}
