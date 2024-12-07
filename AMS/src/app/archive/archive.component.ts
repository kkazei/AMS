import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.services';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.css'
})
export class ArchiveComponent {
  userProfile: any; // Holds user profile information
  paymentDetails: any = null; // Payment details list



  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('User profile loaded:', this.userProfile);
      this.loadArchivedPaymentDetails();

    } else {
      console.warn('No token found. User is not logged in.');
    }
  }

  // Load payment details
  loadArchivedPaymentDetails(): void {
    this.authService.getArchivedPayments().subscribe(
      (response: any[]) => {
        console.log('Payment details fetched:', response);
        this.paymentDetails = response.map(payment => ({
          ...payment,
          proof_of_payment: `http://localhost/amsAPI/api/${payment.proof_of_payment}`
        }));
      },
      (error) => {
        console.error('Error fetching payment details:', error);
      }
    );
  }
  restorePaymentVisibility(invoiceId: number): void {
    this.authService.restorePaymentVisibility(invoiceId)
      .then((response) => {
        console.log('Payment visibility restored:', response);
        Swal.fire({
          icon: 'success',
          title: 'Payment Restored',
          text: 'The payment visibility has been restored successfully.',
        }).then(() => {
          this.loadArchivedPaymentDetails(); // Refresh the list of archived payments
        });
      })
      .catch((error) => {
        console.error('Error restoring payment visibility:', error);
        Swal.fire({
          icon: 'error',
          title: 'Restore Failed',
          text: 'Failed to restore the payment visibility. Please try again later.',
        });
      });
  }
  
}
