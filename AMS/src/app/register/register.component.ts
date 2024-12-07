import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // Registration fields
  user_email = '';
  confirmPassword = '';
  fullname = '';
  user_phone = '';
  password = '';
  user_role = 'admin';

  constructor(private authService: AuthService, private router: Router) {}

  // Method for user registration
  userRegister() {
    // Check if passwords match
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const data = {
      user_email: this.user_email,
      password: this.password,
      fullname: this.fullname,
      user_phone: this.user_phone,
      user_role: 'admin', // Assign role as 'user' or 'admin' as needed
    };

    console.log(data); // Debugging line

    this.authService.registerData(data).subscribe(
      (response) => {
        console.log('Registration successful:', response);
        this.router.navigate(['/login']); // Redirect to login page after registration

        // Reset the registration fields
        this.user_email = '';
        this.password = '';
        this.confirmPassword = '';
        this.fullname = '';
        this.user_phone = '';
      },
      (error) => {
        console.error('Error during registration:', error);
      }
    );
  }

  goToLogin() {
    this.router.navigate(['/login']); // Navigate to the register page
  }
}
