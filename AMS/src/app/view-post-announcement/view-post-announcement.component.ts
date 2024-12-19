import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.services';
@Component({
  selector: 'app-view-post-announcement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-post-announcement.component.html',
  styleUrl: './view-post-announcement.component.css'
})
export class ViewPostAnnouncementComponent implements OnInit {
  postId!: number; // Use the non-null assertion operator
  posts: any;
  
  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {}
  ngOnInit(): void {
    console.log('ngOnInit called');
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.postId = +idParam;
      this.getPosts();
    } else {
      console.error('No postId found in route parameters');
    }
  }
  
  
  getPosts(): void {
    this.authService.getPosts().subscribe(
      (response: any[]) => {
        console.log('Posts fetched:', response);
        const posts = response.map(post => {
          return {
            ...post,
            image_path: `http://localhost/amsAPI/api/${post.image_path}` // Adjust the base URL as needed
          };
        });
        console.log('Mapped posts:', posts);
  
        // Compare using post.post_id instead of post.id
        this.posts = posts.find(post => +post.post_id === this.postId);
        console.log('Found post:', this.posts);
  
        if (!this.posts) {
          console.error('Announcement not found for postId:', this.postId);
        }
      },
      (error) => {
        console.error('Error fetching posts:', error);
      }
    );
  }  
  navigateToComponent(): void {
    this.router.navigate(['/landlord-announcements']);
  }
}