import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../services/auth.services';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


Chart.register(...registerables); // Register Chart.js components

@Component({
  selector: 'app-landlord-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './landlord-dashboard.component.html',
  styleUrls: ['./landlord-dashboard.component.css']
})
export class LandlordDashboardComponent implements OnInit {
  userProfile: any;
  title: string ='';
  content: string ='';
  room: string = '';
  rent: number = 0;
  description: string = '';
  message: string = '';
  posts: any[] = [];
  apartments: any[] = [];
  tenants: any[] = [];
  totalIncome: number = 0;
  selectedApartmentId: number | null = null;
  selectedTenantId: number | null = null;
  selectedFile: File | null = null;
  
  
  
  currentDate: string = new Date().toLocaleDateString();

  income: number = 0;
  vacantCount: number = 0;
  acquiredCount: number = 0;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      this.fetchData();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);

      this.getPosts();
      this.getApartments();
      this.getTenants();
    } else {
      console.error('User not logged in. JWT token missing.');
    }

    this.renderChart();
  }

  fetchData(): void {
    this.getTenants();
    this.getApartments();
    this.getPosts();
  }

  openTenantModal(){
    const modal = document.getElementById("TenantModal")
    if(modal != null){
      modal.style.display = "block";
    }
  }
  closeTenantModal(){
    const modal = document.getElementById("TenantModal")
    if(modal != null){
      modal.style.display = "none";
    }
  }
//Room Modal
  openRoomModal(){
    const modal = document.getElementById("RoomModal")
    if(modal != null){
      modal.style.display = "block";
    }
  }
  closeRoomModal(){
    const modal = document.getElementById("RoomModal")
    if(modal != null){
      modal.style.display = "none";
    }
  }
  
  openConcernsModal(){
    const modal = document.getElementById("ConcernsModal")
    if(modal != null){
      modal.style.display = "block";
    }
  }
  closeConcersModal(){
    const modal = document.getElementById("ConcernModal")
    if(modal != null){
      modal.style.display = "none";
    }
  }

  openAnnouncementsModal(){
    const modal = document.getElementById("AnnouncementsModal")
    if(modal != null){
      modal.style.display = "block";
    }
  }
  closeAnnouncementsModal(){
    const modal = document.getElementById("AnnouncementsModal")
    if(modal != null){
      modal.style.display = "none";
    }
  }

  getTenants(): void {
    this.authService.getTenants().subscribe(
      (response) => {
        this.tenants = response;
  
        // Debugging: Log all tenants
        console.log('Fetched tenants:', this.tenants);
  
        // Calculate the total income
        this.totalIncome = this.tenants.reduce((total, tenant) => {
          if (tenant.rent && tenant.status === 'paid') {
            console.log(`Adding rent from tenant:`, tenant);
            return total + parseFloat(tenant.rent); // Ensure rent is treated as a number
          }
          return total;
        }, 0);
  
        // Debugging: Log the calculated total income
        console.log('Total Income:', this.totalIncome);
      },
      (error) => console.error('Error fetching tenants:', error)
    );
  }
  


  getApartments(): void {
    this.authService.getApartments().subscribe(
      (response) => {
        this.apartments = response;
        this.updateSummaryStats();  // Update stats after fetching apartments
      },
      (error) => console.error('Error fetching apartments:', error)
    );
  }

  getPosts(): void {
    this.authService.getPosts().subscribe(
      (response) => (this.posts = response),
      (error) => console.error('Error fetching posts:', error)
    );
  }

  updateSummaryStats(): void {
    this.vacantCount = this.apartments.filter(a => !a.tenant_id).length;
    this.acquiredCount = this.apartments.length - this.vacantCount;

    this.income = this.tenants.reduce((total, tenant) => total + tenant.amount, 0);
  }


  renderChart(): void {
    const ctx = document.getElementById('income-expense-chart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Income',
            data: [150000, 170000, 140000, 160000, 180000, 200000, 190000, 175000, 185000, 195000, 210000, 220000],
            backgroundColor: '#3eb06e',
          },
          {
            label: 'Expenses',
            data: [30000, 40000, 35000, 38000, 50000, 45000, 47000, 48000, 50000, 52000, 55000, 58000],
            backgroundColor: '#2b305e',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Income and Expenses Overview of 2024' },
        },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

 createPost() {
  const postData = new FormData();
  postData.append('title', this.title.trim() || 'Untitled Post');
  postData.append('content', this.content.trim());
  postData.append('landlord_id', this.userProfile.id.toString());

  if (this.selectedFile) {
    postData.append('image', this.selectedFile, this.selectedFile.name);
  }

  this.authService.createAnnouncement(postData).subscribe(
    (response) => {
      console.log('Post created successfully:', response);
      this.message = 'Post created successfully!';
      this.getPosts();
    },
    (error) => {
      console.error('Error creating post:', error);
      this.message = 'Failed to create post.';
    }
  );
}


  createApartment() {
    const apartmentData = {
      room: this.room.trim(),
      rent: this.rent,
      description: this.description.trim(),
      landlord_id: this.userProfile.id,
    };

    this.authService.createApartment(apartmentData).subscribe(
      (response) => {
        console.log('Apartment created successfully:', response);
        this.message = 'Apartment created successfully!';
        this.getApartments();
      },
      (error) => {
        console.error('Error creating apartment:', error);
        this.message = 'Failed to create apartment.';
      }
    );
  }

  assignTenantToApartment() {
    if (!this.selectedApartmentId || !this.selectedTenantId) {
      console.error('Apartment and Tenant selection is required');
      this.message = 'Please select both an apartment and a tenant.';
      return;
    }

    const assignmentData = {
      apartment_id: this.selectedApartmentId,
      tenant_id: this.selectedTenantId,
    };

    this.authService.assignTenantToApartment(assignmentData).subscribe(
      (response) => {
        console.log('Tenant assigned successfully:', response);
        this.message = 'Tenant assigned successfully!';
        this.getApartments(); // Refresh the apartments after assignment
      },
      (error) => {
        console.error('Error assigning tenant:', error);
        this.message = 'Failed to assign tenant.';
      }
    );
  }

  // Updated method to handle only 'remove_tenant'
  updateApartmentAndTenant(action: string) {
    if (!this.selectedApartmentId) {
      console.error('Apartment selection is required');
      this.message = 'Please select an apartment.';
      return;
    }
  
    // Handle 'remove_tenant' action
    if (action === 'remove_tenant') {
      if (!this.selectedTenantId) {
        console.error('Tenant selection is required for removal');
        this.message = 'Please select a tenant for removal.';
        return;
      }
  
      const updateData: any = {
        apartment_id: this.selectedApartmentId,
        action: action,
        tenant_id: this.selectedTenantId,  // Include tenant_id for removal
      };
  
      this.authService.updateApartmentAndTenant(updateData).subscribe(
        (response) => {
          console.log('Tenant removed successfully:', response);
          this.message = 'Tenant removed successfully!';
          this.getApartments(); // Refresh the apartments after removal
          this.getTenants(); // Refresh tenants to reflect changes
        },
        (error) => {
          console.error('Error removing tenant:', error);
          this.message = 'Failed to remove tenant.';
        }
      );
    }
    // Handle 'assign_tenant' action
    else if (action === 'assign_tenant') {
      if (!this.selectedTenantId) {
        console.error('Tenant selection is required for assignment');
        this.message = 'Please select a tenant for assignment.';
        return;
      }
  
      const assignmentData: any = {
        apartment_id: this.selectedApartmentId,
        tenant_id: this.selectedTenantId,  // Include tenant_id for assignment
      };
  
      this.authService.assignTenantToApartment(assignmentData).subscribe(
        (response) => {
          console.log('Tenant assigned successfully:', response);
          this.message = 'Tenant assigned successfully!';
          this.getApartments(); // Refresh the apartments after assignment
          this.getTenants(); // Refresh tenants to reflect changes
        },
        (error) => {
          console.error('Error assigning tenant:', error);
          this.message = 'Failed to assign tenant.';
        }
      );
    } else {
      console.error('Invalid action:', action);
      this.message = 'Invalid action specified.';
    }
  }

}