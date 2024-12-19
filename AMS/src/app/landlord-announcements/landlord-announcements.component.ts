import { Component } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-landlord-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landlord-announcements.component.html',
  styleUrls: ['./landlord-announcements.component.css'] // Note: Ensure plural "styleUrls"
})
export class LandlordAnnouncementsComponent {
  userProfile: any;
  posts: any[] = [];
  title: string = '';
  content: string = '';
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
        console.error('Access denied. User is not a landlord.');
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
        this.posts = response.map(post => ({
          ...post,
          image_path: `http://localhost/amsAPI/api/${post.image_path}` // Adjust the base URL as needed
        }));
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
      (response: any) => {
        console.log('Post created successfully:', response);
        Swal.fire({
          icon: 'success',
          title: 'Post Created',
          text: 'Your announcement post has been created successfully!',
        }).then(() => {
          // Prepend the newly created post to the top of the list
          const newPost = {
            ...response,
            image_path: response.image_path
              ? `http://localhost/amsAPI/api/${response.image_path}`
              : null, // Ensure the correct URL
          };
          this.posts.unshift(newPost); // Add the new post to the beginning of the array
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
        this.posts = this.posts.filter(post => post.post_id !== postId);
      },
      (error) => {
        console.error('Error deleting post:', error);
      }
    );
  }

  viewPostAnnouncement(postId: number): void {
    this.router.navigate(['/view-post-announcement', postId]);
  }

  truncateText(text: string, limit: number = 25): string {
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }
}
