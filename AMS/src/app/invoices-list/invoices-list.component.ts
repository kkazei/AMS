import Swal from 'sweetalert2';
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  generateInvoice(payment: any): void {
    const doc = new jsPDF();

    // Add border
    doc.setLineWidth(0.5);
    doc.rect(5, 5, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10);

    // Add header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice', 105, 20, { align: 'center' });

    // Add company logo
    const imgData = 'data:image/jpeg;base64,...'; // Add your base64 encoded image data here
    doc.addImage(imgData, 'JPEG', 10, 10, 30, 30);

    // Add tenant details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tenant Name: ${payment.tenant_fullname}`, 14, 50);
    doc.text(`Room: ${payment.room || 'N/A'}`, 14, 60);
    doc.text(`Amount: Php${payment.amount}`, 14, 70);
    doc.text(`Reference Number: ${payment.reference_number || 'N/A'}`, 14, 80);
    doc.text(`Payment Date: ${payment.payment_date}`, 14, 90);

    // Add table for payment details
    (doc as any).autoTable({
      startY: 100,
      head: [['Description', 'Amount']],
      body: [
        ['Rent', `₱${payment.amount}`],
        // Add more rows if needed
      ],
      styles: { halign: 'center' },
      headStyles: { fillColor: [22, 160, 133] },
      theme: 'grid'
    });

    // Add footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your payment!', 105, doc.internal.pageSize.height - 20, { align: 'center' });
    doc.text('Contact us: unitpaysolutions@gmail.com | 0992 611 5081', 105, doc.internal.pageSize.height - 10, { align: 'center' });

    // Save the PDF
    doc.save(`${payment.tenant_fullname}-Invoice.pdf`);
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

  deleteImage(imageId: number): void {
    const landlordId = this.userProfile?.id; // Get landlord ID from user profile
  
    if (landlordId) {
      this.authService.deleteImage(landlordId).subscribe(
        (response) => {
          console.log('Image deleted:', response);
  
          // After successful deletion, remove the image from the list
          this.imageInfos = this.imageInfos.filter(image => image.id !== imageId);
  
          Swal.fire({
            icon: 'success',
            title: 'Image Deleted',
            text: 'The image has been deleted successfully.',
          });
        },
        (error) => {
          console.error('Error deleting image:', error);
  
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: 'Failed to delete the image. Please try again later.',
          });
        }
      );
    } else {
      console.warn('Landlord ID is not available.');
      Swal.fire({
        icon: 'warning',
        title: 'No Landlord ID',
        text: 'Cannot delete image. Landlord ID is missing.',
      });
    }
  }
  
  // Update payment visibility (archive payment)
  updatePaymentVisibility(invoiceId: number): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'Do you want to archive this payment?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Archive it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.updatePaymentVisibility(invoiceId)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Payment Archived',
              text: 'The payment has been archived successfully.',
            }).then(() => {
              this.loadPaymentDetails(); // Refresh payment details list
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to archive payment. Please try again.',
            });
          });
      } else {
        console.log('Archive action canceled');
      }
    });
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
