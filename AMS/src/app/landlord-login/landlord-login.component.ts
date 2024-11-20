import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.services';
import { CommonModule } from '@angular/common';
import { FormsModule

 } from '@angular/forms';
@Component({
  selector: 'app-landlord-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landlord-login.component.html',
  styleUrl: './landlord-login.component.css'
})
export class LandlordLoginComponent implements AfterViewInit {
  @ViewChild('container', { static: false }) container!: ElementRef;
  @ViewChild('signInBtn', { static: false }) signInBtn!: ElementRef;
  @ViewChild('signUpBtn', { static: false }) signUpBtn!: ElementRef;

  // Login fields
  username = '';
  password = '';

  // Registration fields
  user_id = '';
  user_email = '';
  confirmPassword = '';
  user_role = 'admin';
  user_lastname = '';
  user_firstname = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngAfterViewInit() {
    // Add event listener for the sign-up button
    this.signUpBtn.nativeElement.addEventListener('click', () => {
      this.container.nativeElement.classList.add('sign-up-mode');
    });

    // Add event listener for the sign-in button
    this.signInBtn.nativeElement.addEventListener('click', () => {
      this.container.nativeElement.classList.remove('sign-up-mode');
    });
  }

  // Method for login
  userLogin() {
    this.authService.login(this.username, this.password).subscribe(
      (data) => {
        console.log('Login successful:', data);
        this.router.navigate(['/landlord-dashboard']);
      },
      (error) => {
        console.log('Login failed:', error);
        this.username = '';
        this.password = '';
      }
    );
  }

  // Method for registration
  userRegister() {
    console.log('Registration method called'); // Debugging line
  
    // Enforce admin role for every registration
    const data = {
      user_id: this.user_id,
      user_email: this.user_email,
      password: this.password,
      user_role: 'admin', // Hardcoded as admin
      user_lastname: this.user_lastname,
      user_firstname: this.user_firstname,
    };
  
    console.log(data); // Debugging line
  
    this.authService.registerData(data).subscribe(
      (response) => {
        console.log('Registration successful:', response);
        // Switch to the sign-in form after successful registration
        this.container.nativeElement.classList.remove('sign-up-mode');
  
        // Reset registration fields
        this.user_id = '';
        this.user_email = '';
        this.password = '';
        this.user_role = '';
        this.user_lastname = '';
        this.user_firstname = '';
      },
      (error) => {
        console.error('Error during registration:', error);
      }
    );
  }
}