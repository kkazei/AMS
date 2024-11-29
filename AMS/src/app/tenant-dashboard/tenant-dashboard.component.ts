import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './tenant-dashboard.component.html',
  styleUrls: ['./tenant-dashboard.component.css']
})
export class TenantDashboardComponent implements OnInit {
  userProfile: any;
  tenant: any = {};
  currentDate: Date = new Date();
  paymentAmount: number | null = null;
  paymentReferenceNumber: string = '';
  paymentProofOfPayment: File | null = null;
  paymentMessage: string = '';
  isPaymentFormVisible: boolean = false;
  concerns: any[] = [];
  concerntitle: string = '';
  concerncontent: string = '';
  selectedImage: File | null = null;
  message: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      this.fetchTenantDetails();
    } else {
      console.warn('Token not found, user is not logged in');
    }
  }

  // Fetch tenant details including rent and due date
  fetchTenantDetails(): void {
    this.authService.getTenants().subscribe(
      (response) => {
        if (Array.isArray(response)) {
          this.tenant = response.find((tenant) => tenant.tenant_email === this.userProfile.email);
          if (this.tenant) {
            this.paymentAmount = this.tenant.rent; // Set the payment amount to current rent
          }
        }
      },
      (error) => {
        console.error('Error fetching tenant details:', error);
      }
    );
  }

  // Handle click on Pay Now button
  onPayNow(): void {
    this.isPaymentFormVisible = true; // Show the payment form
  }

  // Handle file selection
  onPaymentProofFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      this.paymentProofOfPayment = input.files[0]; // Store the payment proof file
    }
  }
  
  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      this.selectedImage = input.files[0]; // Store the selected image
    }
  }
  
  

  // Create a new concern
  createConcern() {
    const concernData = new FormData();
    concernData.append('title', this.concerntitle.trim() || 'No Subject');
    concernData.append('content', this.concerncontent.trim());
    concernData.append('tenant_id', this.userProfile.id.toString());

    // If a file is selected, append it to the FormData
    if (this.selectedImage) {
      concernData.append('attachment', this.selectedImage, this.selectedImage.name);
    }

    this.authService.createConcerns(concernData).subscribe(
      (response) => {
        console.log('Concern submitted successfully:', response);
        this.message = 'Concern submitted successfully!';
      },
      (error) => {
        console.error('Error submitting concern:', error);
        this.message = 'Failed to submit concern.';
      }
    );
  }

  // Handle form submission for payment
  onPayInvoice(): void {
    if (!this.paymentReferenceNumber || !this.paymentProofOfPayment) {
      this.paymentMessage = 'Reference number and proof of payment are required.';
      return;
    }
  
    if (this.paymentAmount === null) {
      this.paymentMessage = 'Payment amount is required.';
      return;
    }
  
    this.authService
      .payInvoice(
        this.tenant.tenant_id,
        this.paymentAmount, // Now it's guaranteed to be a number
        this.paymentReferenceNumber,
        this.paymentProofOfPayment
      )
      .subscribe(
        (response) => {
          console.log('Payment successful:', response);
          this.paymentMessage = 'Payment successfully submitted!';
          this.isPaymentFormVisible = false; // Hide the payment form after submission
          window.location.reload(); // Refresh the page
        },
        (error) => {
          console.error('Error making payment:', error);
          this.paymentMessage = 'Failed to submit payment.';
        }
      );
  }
  
}
