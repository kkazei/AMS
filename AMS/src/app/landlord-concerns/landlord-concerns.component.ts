import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landlord-concerns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landlord-concerns.component.html',
  styleUrl: './landlord-concerns.component.css'
})
export class LandlordConcernsComponent implements OnInit {
  userProfile: any;
  concerns: any[] = [];
  concerntitle: string = '';
  concerncontent: string = '';
  selectedConcern: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();

      console.log('Token:', token);
      console.log('User profile:', this.userProfile);

      this.getConcerns();
    } else {
      console.error('User not logged in. JWT token missing.');
    }
  }

  getConcerns() {
    this.authService.getConcerns().subscribe(
      (response: any[]) => {
        console.log('Concerns fetched:', response);
        this.concerns = response.map(concern => {
          return {
            ...concern,
            image_path: `http://localhost/amsAPI/api/${concern.image_path}` // Adjust the base URL as needed
          };
        });
        console.log('Concerns with updated image paths:', this.concerns);
      },
      (error) => {
        console.error('Error fetching concerns:', error);
      }
    );
  }

  selectConcern(concern: any) {
    this.selectedConcern = { ...concern };
  }

  updateConcern(): void {
    if (this.selectedConcern) {
      this.authService.updateConcerns(this.selectedConcern).subscribe(
        (response) => {
          console.log('Concern updated successfully:', response);
  
          Swal.fire({
            icon: 'success',
            title: 'Concern Updated',
            text: 'The concern has been updated successfully!',
          }).then(() => {
            this.getConcerns(); // Refresh the concerns list
            this.selectedConcern = null; // Clear the selected concern
          });
        },
        (error) => {
          console.error('Error updating concern:', error);
  
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'Failed to update the concern. Please try again later.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'No Concern Selected',
        text: 'Please select a concern to update.',
      });
    }
  }
  
}