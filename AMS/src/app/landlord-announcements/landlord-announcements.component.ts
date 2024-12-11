import { Component } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-landlord-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landlord-announcements.component.html',
  styleUrl: './landlord-announcements.component.css'
})
export class LandlordAnnouncementsComponent {
  userProfile: any;
  posts: any[] = [];
  title: string ='';
  content: string ='';
  selectedFile: File | null = null;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);
  
      if (this.userProfile.usertype === 'landlord') {
        this.getPosts();
      } else {
        console.error('Access denied. User is not an admin.');
        this.router.navigate(['/login']);
      }
    } else {
      console.error('User not logged in. JWT token missing.');
      this.router.navigate(['/login']);
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
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
        Swal.fire({
          icon: 'success',
          title: 'Post Created',
          text: 'Your announcement post has been created successfully!',
        }).then(() => {
          this.getPosts(); // Refresh posts
          this.title = '';
          this.content = '';
          this.selectedFile = null;
        });
      },
      (error) => {
        console.error('Error creating post:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create the post. Please try again later.',
        });
      }
    );
  }

  deletePost(postId: number) {
    this.authService.deletePost(postId).subscribe(
      (response) => {
        console.log('Post deleted:', response);
        // Remove the deleted post from the posts array
        this.posts = this.posts.filter(post => post.post_id !== postId);
      },
      (error) => {
        console.error('Error deleting post:', error);
      }
    );
  }
}  
