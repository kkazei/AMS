import Swal from 'sweetalert2';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.services';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-topnav',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './topnav.component.html',
  styleUrl: './topnav.component.css'
})
export class TopnavComponent {
  isMenuCollapsed = true;

  constructor(private authService: AuthService, private router: Router) {}
  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  logout() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You will be logged out.',
      showCancelButton: true,
      confirmButtonText: 'Yes, Log me out',
      cancelButtonText: 'Cancel',
      reverseButtons: true, // Places the Cancel button on the left
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout().subscribe({
          next: (response) => {
            console.log('Logged out successfully:', response);
  
            // Success modal
            Swal.fire({
              icon: 'success',
              title: 'Logged Out',
              text: 'You have successfully logged out.',
            }).then(() => {
              // Navigate to the login page after logout
              this.router.navigate(['/tenant-login']);
            });
          },
          error: (error) => {
            console.error('Logout error:', error);
  
            // Error modal
            Swal.fire({
              icon: 'error',
              title: 'Logout Failed',
              text: 'An error occurred while logging out. Please try again.',
            });
          },
        });
      } else {
        // User canceled logout action, you can display a message if needed
        console.log('Logout canceled');
      }
    });
  }
  
}

