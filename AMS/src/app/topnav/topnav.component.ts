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
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logged out successfully:', response);
        this.router.navigate(['/tenant-login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      },
    });
  }
}

