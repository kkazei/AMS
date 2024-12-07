import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule, RouterModule],
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
  preview: string = '';
  imageInfos: any[] = [];
  selectedPaymentMethod: string = 'onhand'; // Default to 'onhand'
  paymentDetails: any = null; // Payment details list
  leaseDetails: any = null; // Lease details list
  leaseImages: any[] = []; // Lease images list
  posts: any[] = [];
  paymentProof: File | null = null; // To store the uploaded file
paymentProofPreview: string | null = null; // To store the preview URL of the uploaded file




  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('User profile:', this.userProfile);

      if (this.userProfile.usertype === 'tenant') {

      this.fetchTenantDetails();
      this.loadImages();
      this.loadPaymentDetails();
      this.loadLeaseImages();
      this.getPosts();
    } else {
      console.error('Access denied. User is not an admin.');
      this.router.navigate(['/tenant-login']);
    }
  } else {
    console.error('User not logged in. JWT token missing.');
    this.router.navigate(['/tenant-login']);
  }
}



 

  loadPaymentDetails(): void {
    this.authService.getPaymentDetails().subscribe(
      (response: any[]) => {
        console.log('Payment details fetched:', response);
  
        const currentUserId = this.userProfile?.id; // Use the logged-in user's ID
        if (!currentUserId) {
          console.error('User ID not found. Unable to filter payments.');
          return;
        }
  
        // Filter payment details for the logged-in tenant
        this.paymentDetails = response
          .filter(payment => payment.tenant_id === currentUserId)
          .map(payment => ({
            ...payment,
            proof_of_payment: payment.proof_of_payment
              ? `http://localhost/amsAPI/api/${payment.proof_of_payment}`
              : null
          }));
  
        console.log('Filtered payment details for user:', this.paymentDetails);
      },
      (error) => {
        console.error('Error fetching payment details:', error);
      }
    );
  }

  loadLeaseImages(): void {
    const currentUserId = this.userProfile?.id; // Use the logged-in user's ID
    if (!currentUserId) {
      console.error('User ID not found. Unable to load lease images.');
      return;
    }
  
    this.authService.loadLease(currentUserId).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          // Filter the images based on the tenant ID to make sure we only display images for the current user
          this.leaseImages = response.data
            .filter((image: any) => image.tenant_id === currentUserId) // Ensure the tenant_id matches
            .map((image: any) => {
              return {
                ...image,
                img: `http://localhost/amsAPI/api/${image.img}` // Adjust path as needed
              };
            });
          console.log('Filtered lease images for user:', this.leaseImages);
        } else {
          console.error('Failed to retrieve images:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching images:', error);
      }
    );
  }

  getPosts() {
    this.authService.getPosts().subscribe(
      (response: any[]) => {
        console.log('Posts fetched:', response);
        this.posts = response.map(post => {
          return {
            ...post,
            image_path: `http://localhost/amsAPI/api/${post.image_path}` // Adjust the base URL as needed
          };
        });
        console.log('Posts with updated image paths:', this.posts);
      },
      (error) => {
        console.error('Error fetching posts:', error);
      }
    );
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
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
  
      // Generate preview
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.paymentProofPreview = e.target?.result as string;
      };
  
      reader.readAsDataURL(file);
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
        
        // Success modal
        Swal.fire({
          icon: 'success',
          title: 'Concern Submitted',
          text: 'Your concern has been submitted successfully!',
        }).then(() => {
          this.message = 'Concern submitted successfully!';
          // You can reset the form here if needed
          this.concerntitle = '';
          this.concerncontent = '';
          this.selectedImage = null;
        });
      },
      (error) => {
        console.error('Error submitting concern:', error);
        
        // Error modal
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Failed to submit your concern. Please try again.',
        }).then(() => {
          this.message = 'Failed to submit concern.';
        });
      }
    );
  }
  

  // Handle form submission for payment
  onPayInvoice(): void {
    if (!this.paymentReferenceNumber || !this.paymentProofOfPayment) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Reference number and proof of payment are required.',
      });
    }
  
    if (this.paymentAmount === null) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Payment Amount',
        text: 'Payment amount is required.',
      });
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
          
          // Success modal
          Swal.fire({
            icon: 'success',
            title: 'Payment Successful',
            text: 'Your payment has been successfully submitted!',
          }).then(() => {
            this.isPaymentFormVisible = false; // Hide the payment form after submission
            window.location.reload(); // Refresh the page
          });
        },
        (error) => {
          console.error('Error making payment:', error);
          
          // Error modal
          Swal.fire({
            icon: 'error',
            title: 'Payment Failed',
            text: 'There was an issue submitting your payment. Please try again.',
          }).then(() => {
            this.paymentMessage = 'Failed to submit payment.';
          });
        }
      );
  }
  

  togglePaymentForm(): void {
    this.isPaymentFormVisible = !this.isPaymentFormVisible;
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

  trackByFn(index: number, item: any) {
    return item.imgName; // Use a unique identifier for each item
  }

  //Concerns Modal
  openConcernsModal(){
    const modal = document.getElementById("ConcernsModal")
    if(modal != null){
      modal.style.display = "block";
    }
  }
  closeConcernsModal(){
    const modal = document.getElementById("ConcernsModal")
    if(modal != null){
      modal.style.display = "none";
    }
  }

   //Lease Modal
   openLeaseModal(){
    const modal = document.getElementById("LeaseModal")
    if(modal != null){
      modal.style.display = "block";
    }
  }
  closeLeaseModal(){
    const modal = document.getElementById("LeaseModal")
    if(modal != null){
      modal.style.display = "none";
    }
  }


  //Profile Modal
  openProfileModal(){
    const modal = document.getElementById("ProfileModal")
    if(modal != null){
      modal.style.display = "block";
    }
  }
  closeProfileModal(){
    const modal = document.getElementById("ProfileModal")
    if(modal != null){
      modal.style.display = "none";
    }
  }

  //Pay History Modal
  openPayHistoryModal(){
    const modal = document.getElementById("PayHistoryModal")
    if(modal != null){
      modal.style.display = "block";
    }
  }
  closePayHistoryModal(){
    const modal = document.getElementById("PayHistoryModal")
    if(modal != null){
      modal.style.display = "none";
    }
  }

  printImage(imageSrc: string): void {
    if (!imageSrc) {
      console.error('No image source provided for printing.');
      return;
    }
  
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Lease Image</title>
            <style>
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
              }
              img {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            <img src="${imageSrc}" alt="Lease Image" />
            <script>
              window.onload = () => {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
  

}
