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
  userProfile: any;
  paymentTenantId: string | null = null;
  paymentAmount: number | null = null;
  paymentReferenceNumber: string = '';
  paymentProofOfPayment: File | null = null;
  paymentMessage: string = '';
  paymentDetails: any = null;
  selectedFile: File | null = null;
  preview: string = '';
  imageInfos: any[] = [];
  message: string = '';
  description: string = ''; // Add a field for description

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);
      this.loadImages();
      this.loadPaymentDetails();
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
            proof_of_payment: `http://localhost/amsAPI/api/${payment.proof_of_payment}`
          };
        });
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
              img: `http://localhost/amsAPI/api/${image.img}`
            };
          });
        } else {
          console.error('Failed to retrieve images:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching images:', error);
      }
    );
  }

  onFileSelected(event: any) {
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

  upload() {
    const landlordId = this.userProfile?.id; // Assuming the landlord_id is part of the user profile
    if (this.paymentProofOfPayment && this.description && landlordId) {
      this.authService.addImage(this.paymentProofOfPayment, this.description, landlordId).subscribe(
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
      console.warn('No file, description, or landlord ID provided');
      this.message = 'Please select a file, provide a description, and ensure the landlord ID is available.';
    }
  }
  

  trackByFn(index: number, item: any) {
    return item.imgName;
  }
}
