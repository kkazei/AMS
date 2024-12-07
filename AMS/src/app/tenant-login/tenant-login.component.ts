import Swal from 'sweetalert2';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.services';

@Component({
  selector: 'app-tenant-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './tenant-login.component.html',
  styleUrl: './tenant-login.component.css'
})
export class TenantLoginComponent {

  // Login fields
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}


  // Method for login
  userLogin() {
    this.authService.loginTenant(this.username, this.password).subscribe(
      (data) => {
        console.log('Login successful:', data);
        
        // Store the JWT token if necessary for further use (e.g., in localStorage or sessionStorage)
        localStorage.setItem('jwt', data.jwt); // Store JWT token for later requests
        
        // Success modal
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'Welcome to your tenant dashboard!',
        }).then(() => {
          // Navigate to the tenant dashboard after successful login
          this.router.navigate(['/tenant-dashboard']);
        });
      },
      (error) => {
        console.log('Login failed:', error);
        
        // Error modal
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid username or password. Please try again.',
        }).then(() => {
          // Clear the input fields after the error
          this.username = '';
          this.password = '';
        });
      }
    );
  }
  

  // Method for registration
  goToRegister() {
    this.router.navigate(['/tenant-register']); // Navigate to the register page
  }
}