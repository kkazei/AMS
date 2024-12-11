import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.services';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-tenants-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenants-profile.component.html',
  styleUrl: './tenants-profile.component.css'
})
export class TenantsProfileComponent {
  userProfile: any;
  selectedFile: File | null = null; // Store the selected file
  preview: string = ''; // File preview URL
  tenants: any[] = []; // Store the list of tenants
  selectedTenant: any = null; // Store the selected tenant's details
  leaseImages: any[] = []; // Store the list of lease images for the selected tenant
  selectedProof: any = null; // Selected proof for modal
  paymentProofOfPayment: File | null = null;
  description: string = '';
  imageInfos: any[] = []; // Replace with the actual type of imageInfos
  paymentTenantId: string | null = null; // Tenant ID for payments
  paymentAmount: number | null = null; // Amount for payments
  paymentReferenceNumber: string = ''; // Reference number for payments
  paymentMessage: string = ''; // Message for payment feedback
  paymentDetails: any = null; // Payment details list
  message: string = ''; // Upload feedback message
  searchQuery: string = ''; // Search query for filtering payments
  currentPage: number = 1; // Tracks the current page
  itemsPerPage: number = 10; // Number of items per page
  totalPages: number = 1; // Total pages, calculated dynamically

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      this.getTenants(); // Fetch tenants from API
    } else {
      console.warn('Token not found, user is not logged in');
    }
  }

  // Fetch tenants with room details from the API
  getTenants() {
    this.authService.getTenants().subscribe(
      (response) => {
        if (Array.isArray(response)) {
          this.tenants = response;
        } else {
          console.error('Unexpected response format:', response);
          this.tenants = [];
        }
      },
      (error) => {
        console.error('Error fetching tenants:', error);
      }
    );
  }

  // Fetch payment details for the selected tenant
  getPaymentDetails() {
    if (this.selectedTenant) {
      this.authService.getPaymentDetails().subscribe(
        (response: any[]) => {
          console.log('Payment details fetched:', response);
          this.paymentDetails = response
            .filter(payment => payment.tenant_id === this.selectedTenant.tenant_id)
            .map(payment => ({
              ...payment,
              proof_of_payment: payment.proof_of_payment ? `http://localhost/amsAPI/api/${payment.proof_of_payment}` : null
            }));
          console.log('Payment details for selected tenant:', this.paymentDetails);
        },
        (error) => {
          console.error('Error fetching payment details:', error);
        }
      );
    } else {
      console.warn('No tenant selected');
    }
  }

  // Select a tenant to view their details
  selectTenant(tenant: any) {
    this.selectedTenant = tenant;
    this.getPaymentDetails(); // Fetch payment details for the selected tenant
    this.loadLeaseImages(); // Load lease images for the selected tenant
  }

  // Fetch lease images for the selected tenant
  loadLeaseImages() {
    if (this.selectedTenant) {
      const tenantId = this.selectedTenant.tenant_id; // Get the selected tenant's ID
      this.authService.loadLease(tenantId).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            // Filter the images based on the tenant ID to make sure we only display images for the selected tenant
            this.leaseImages = response.data
              .filter((image: any) => image.tenant_id === tenantId) // Ensure the tenant_id matches
              .map((image: any) => {
                return {
                  ...image,
                  img: `http://localhost/amsAPI/api/${image.img}` // Adjust path as needed
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

  // Handle file selection
  onFileSelectedLease(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.preview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Upload the selected file for the selected tenant
  upload(): void {
    if (this.selectedFile && this.selectedTenant) {
      const tenantId = this.selectedTenant.tenant_id;
      const room = this.selectedTenant.room;
  
      this.authService.addLease(this.selectedFile, tenantId, room).subscribe(
        (response) => {
          // Success modal
          Swal.fire({
            icon: 'success',
            title: 'Lease Uploaded',
            text: 'The lease has been uploaded successfully!',
          }).then(() => {
            this.message = 'Lease uploaded successfully!';
            this.preview = ''; // Clear the preview after successful upload
            this.selectedFile = null;
            this.loadLeaseImages(); // Reload the lease images after successful upload
          });
        },
        (error) => {
          // Error modal
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: 'Failed to upload the lease. Please try again later.',
          });
          console.error('Error uploading lease:', error);
        }
      );
    } else {
      // Validation modal for missing file or tenant
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Details',
        text: 'Please select a tenant and file before uploading!',
      });
    }
  }
  

  // Track tenants in the grid using a unique identifier
  trackByFn(index: number, item: any) {
    return item.tenant_id;
  }



  closeAll() {
    this.selectedTenant = null; // Hide tenant details
    this.leaseImages = [];     // Clear lease images
    this.preview = "";       // Clear the file preview
    this.message = "";       // Clear any status message
  }
  openProofModal(proof: any): void {
    this.selectedProof = proof;
    const modal = document.getElementById("ProofModal");
    if (modal != null) {
      modal.style.display = "block";
    }
  }

  closeProofModal(): void {
    const modal = document.getElementById("ProofModal");
    if (modal != null) {
      modal.style.display = "none";
    }
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
  uploadImage(): void {
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
              this.getPaymentDetails(); // Refresh payment details list
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
}
