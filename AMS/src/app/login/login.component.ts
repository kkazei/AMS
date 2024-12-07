import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {


  // Login fields
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}


  // Method for login
  userLogin() {
    this.authService.login(this.username, this.password).subscribe(
      (data) => {
        console.log('Login successful:', data);
        
        // Store the JWT token if necessary for further use (e.g., in localStorage or sessionStorage)
        localStorage.setItem('jwt', data.jwt); // Store JWT token for later requests
        
        // Navigate to the landlord dashboard or another route after successful login
        this.router.navigate(['/landlord-dashboard']);
      },
      (error) => {
        console.log('Login failed:', error);
        this.username = '';
        this.password = '';
      }
    );
  }

  goToRegister() {
    this.router.navigate(['/register']); // Navigate to the register page
  }
}