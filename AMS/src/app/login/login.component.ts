import Swal from 'sweetalert2';
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
        
        // Store the JWT token
        localStorage.setItem('jwt', data.jwt);
        
        // Show success modal
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'You have successfully logged in!',
        }).then(() => {
          // Navigate after the user closes the modal
          this.router.navigate(['/landlord-dashboard']);
        });
      },
      (error) => {
        console.log('Login failed:', error);
  
        // Show error modal
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid Credentials.',
        });
  
        // Clear the input fields
        this.username = '';
        this.password = '';
      }
    );
  }
  

  goToRegister() {
    this.router.navigate(['/register']); // Navigate to the register page
  }
}