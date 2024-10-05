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
export class LoginComponent implements AfterViewInit {
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
  user_role = '';
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
        this.router.navigate(['/feed']);
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
    if (this.password !== this.confirmPassword) {
      console.log('Passwords do not match');
      return;
    }

    const data = {
      user_id: this.user_id,
      user_email: this.user_email,
      password: this.password,
      user_role: this.user_role,
      user_lastname: this.user_lastname,
      user_firstname: this.user_firstname,
    };

    console.log(data);

    this.authService.registerData(data).subscribe(
      (response) => {
        console.log('Registration successful:', response);
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error during registration:', error);
      }
    );
  }
}
