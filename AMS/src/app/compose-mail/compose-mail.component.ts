import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.services';

@Component({
  selector: 'app-compose-mail',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './compose-mail.component.html',
  styleUrls: ['./compose-mail.component.css'],
})
export class ComposeMailComponent implements OnInit {
  subject: string = 'Payment Due';
  email: string[] = []; // Explicitly typed as string array
  message: string = '';

  constructor(private mailService: AuthService) {}

  ngOnInit() {}

  // Function to handle email input
  handleEmailInput(event: Event) {
    const inputText = (event.target as HTMLInputElement).value; // Type assertion for event.target
    const separatedEmails: string[] = inputText.split(/[ ,;]+/);
    this.email = separatedEmails.filter(email => email.trim() !== '');
  }

  // Function to send the email
  sendMail() {
    if (!this.email.length) {
      console.error('No email address provided.');
      return;
    }

    const mailData = {
      email: this.email.join(', '),
      subject: this.subject,
      message: this.message,
    };

    this.mailService.sendMail(mailData).subscribe(
      response => {
        console.log('Mail sent successfully:', response);
      },
      error => {
        console.error('Error sending mail:', error);
      }
    );
  }
}
