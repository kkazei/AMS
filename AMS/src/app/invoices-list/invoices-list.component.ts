import { Component } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoices-list.component.html',
  styleUrl: './invoices-list.component.css'
})
export class InvoicesListComponent {
  userProfile: any;
  paymentTenantId: string | null = null;
  paymentAmount: number | null = null;
  paymentReferenceNumber: string = '';
  paymentProofOfPayment: File | null = null;
  paymentMessage: string = '';
  paymentDetails: any = null; // Add this line
  selectedFile: File | null = null; // Add this line
  preview: string = '';
  imageInfos: any[] = [];
  message: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);
      this.loadImages(); // Call the new method to load images
      this.loadPaymentDetails(); // Call the new method to load payment details
    } else {
      console.warn('Token not found, user is not logged in');
    }
  }

  loadPaymentDetails(): void {
    this.authService.getPaymentDetails().subscribe(
      (response: any[]) => {
        console.log('Payment details fetched:', response);
        this.paymentDetails = response.map(payment => {
          return {
            ...payment,
            proof_of_payment: `http://localhost/amsAPI/api/${payment.proof_of_payment}` // Adjust the base URL as needed
          };
        });
        console.log('Payment details with updated proof of payment image paths:', this.paymentDetails);
      },
      (error) => {
        console.error('Error fetching payment details:', error);
      }
    );
  }

  loadImages() {
    this.authService.loadImage().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.imageInfos = response.data.map((image: any) => {
            return {
              ...image,
              img: `http://localhost/amsAPI/api/${image.img}` // Adjust path as needed
            };
          });
        } else {
          console.error('Failed to retrieve images:', response.message);
          // Handle error message or fallback as needed
        }
      },
      (error) => {
        console.error('Error fetching images:', error);
        // Handle error as needed
      }
    );
  }  

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.paymentProofOfPayment = file;
    }
  }

  upload() {
    if (this.paymentProofOfPayment) {
      this.authService.addImage(this.paymentProofOfPayment).subscribe(
        (response) => {
          console.log(response);
          this.message = 'File uploaded successfully!';
          this.loadImages(); // Refresh the list of images
        },
        (error) => {
          console.error(error);
          this.message = 'File upload failed!';
        }
      );
    } else {
      console.warn('No file selected');
      this.message = 'Please select a file to upload.';
    }
  }
  

  trackByFn(index: number, item: any) {
    return item.imgName; // Use a unique identifier for each item
  }

}
