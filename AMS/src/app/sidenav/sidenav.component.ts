import Swal from 'sweetalert2';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {
  isCollapsed = false;
  userProfile: any;

  constructor(private authService: AuthService, private router: Router) {}
  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);
  

      
    
    }
  }

  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'No, stay logged in'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout().subscribe({
          next: () => {
            localStorage.removeItem('user_id');
            localStorage.removeItem('alertShown');
            Swal.fire({
              icon: 'success',
              title: 'Logged Out',
              text: 'You have successfully logged out!',
            }).then(() => {
              this.router.navigate(['/login']);
            });
          },
          error: (error) => {
            console.error('Logout error:', error);
            Swal.fire({
              icon: 'error',
              title: 'Logout Failed',
              text: 'An error occurred while logging out.',
            });
          }
        });
      }
    });
  }



  toggleSidenav() {
    this.isCollapsed = !this.isCollapsed;
  }
}
