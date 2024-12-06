import Swal from 'sweetalert2';
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices-list.component.html',
  styleUrl: './invoices-list.component.css'
})
export class InvoicesListComponent {
  userProfile: any; // Holds user profile information
  paymentTenantId: string | null = null; // Tenant ID for payments
  paymentAmount: number | null = null; // Amount for payments
  paymentReferenceNumber: string = ''; // Reference number for payments
  paymentProofOfPayment: File | null = null; // Proof of payment file
  paymentMessage: string = ''; // Message for payment feedback
  paymentDetails: any = null; // Payment details list
  selectedFile: File | null = null; // Selected file for upload
  preview: string = ''; // File preview URL
  imageInfos: any[] = []; // List of images
  message: string = ''; // Upload feedback message
  description: string = ''; // Description for file uploads

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('User profile loaded:', this.userProfile);
      this.loadImages();
      this.loadPaymentDetails();
    } else {
      console.warn('No token found. User is not logged in.');
    }
  }

  // Load payment details
  loadPaymentDetails(): void {
    this.authService.getPaymentDetails().subscribe(
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

  // Load images
  loadImages(): void {
    this.authService.loadImage().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.imageInfos = response.data.map((image: any) => ({
            ...image,
            img: `http://localhost/amsAPI/api/${image.img}`
          }));
        } else {
          console.error('Failed to retrieve images:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching images:', error);
      }
    );
  }

  // Handle file selection and preview
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.paymentProofOfPayment = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.preview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Upload file with description
  upload(): void {
    const landlordId = this.userProfile?.id; // Landlord ID from user profile
  
    if (this.paymentProofOfPayment && this.description && landlordId) {
      this.authService.addImage(this.paymentProofOfPayment, this.description, landlordId).subscribe(
        (response) => {
          console.log('Upload successful:', response);
  
          Swal.fire({
            icon: 'success',
            title: 'Upload Successful',
            text: 'Your file has been uploaded successfully!',
          }).then(() => {
            this.loadImages(); // Refresh the list of images
            this.resetForm();  // Reset preview and description
          });
        },
        (error) => {
          console.error('Upload failed:', error);
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: 'Failed to upload the file. Please try again later.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Details',
        text: 'Please select a file, provide a description, and ensure the landlord ID is available.',
      });
    }
  }
  

  // Reset form fields after successful upload
  resetForm(): void {
    this.preview = ''; // Clear the image preview
    this.description = ''; // Clear the description
    this.paymentProofOfPayment = null; // Clear the file selection
  }

  // Track images by name for rendering
  trackByFn(index: number, item: any): string {
    return item.imgName;
  }
}
