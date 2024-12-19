import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-concern',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-concern.component.html',
  styleUrl: './view-concern.component.css'
})
export class ViewConcernComponent implements OnInit {
  concernId!: number; // Use the non-null assertion operator
  concerns: any;
  
  constructor(private route: ActivatedRoute, private authService: AuthService) {}
  ngOnInit(): void {
    console.log('ngOnInit called');
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.concernId = +idParam;
      this.getConcern();
    } else {
      console.error('No postId found in route parameters');
    }
  }
  
  
  getConcern(): void {
    this.authService.getConcerns().subscribe(
      (response: any[]) => {
        console.log('Posts fetched:', response);
        const concerns = response.map(concern => {
          return {
            ...concern,
            image_path: `http://localhost/amsAPI/api/${concern.image_path}` // Adjust the base URL as needed
          };
        });
        console.log('Mapped posts:', concerns);
  
        // Compare using post.post_id instead of post.id
        this.concerns = concerns.find(concern => +concern.concern_id === this.concernId);
        console.log('Found post:', this.concerns);
  
        if (!this.concerns) {
          console.error('Announcement not found for postId:', this.concernId);
        }
      },
      (error) => {
        console.error('Error fetching posts:', error);
      }
    );
  }  
  markAsSolved(concern: any) {
      concern.status = 'solved';
      this.authService.updateConcerns(concern).subscribe(
        (response) => {
          console.log('Concern marked as solved:', response);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Concern marked as solved.',
          });
        },
        (error) => {
          console.error('Error updating concern:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update the concern. Please try again later.',
          });
        }
      );
    }
}

