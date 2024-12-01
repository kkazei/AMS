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

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logged out successfully:', response);
        this.router.navigate(['/login']); // Redirect to login or any other page
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Optionally display an error message to the user
      },
    });
  }


  toggleSidenav() {
    this.isCollapsed = !this.isCollapsed;
  }
}
