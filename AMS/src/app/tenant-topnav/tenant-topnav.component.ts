import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tenant-topnav',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './tenant-topnav.component.html',
  styleUrl: './tenant-topnav.component.css'
})
export class TenantTopnavComponent {
  constructor(private authService: AuthService, private router: Router) {}

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