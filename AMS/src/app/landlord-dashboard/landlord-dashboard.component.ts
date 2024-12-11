import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../services/auth.services';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';


Chart.register(...registerables); // Register Chart.js components

@Component({
  selector: 'app-landlord-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
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
  concerns: any[] = [];
  concerntitle: string = '';
  concerncontent: string = '';
  isCollapsed = false;
  maintenanceList: any[] = []; // Property to hold fetched maintenance tasks
  totalExpenses: number = 0;
  selectedConcern: { 
    status: string; 
  } | null = null;
  

  
  
  
  currentDate: string = new Date().toLocaleDateString();

  income: number = 0;
  vacantCount: number = 0;
  acquiredCount: number = 0;
  monthlyExpenses: { [month: string]: number } = {};  // Store monthly expenses for maintenance

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);
  
      if (this.userProfile.usertype === 'landlord') {
        this.fetchData();
        this.getConcerns();
        this.getMaintenance();  // Fetch maintenance tasks when component initializes
        this.getPosts();
      } else {
        console.error('Access denied. User is not an admin.');
        this.router.navigate(['/login']);
      }
    } else {
      console.error('User not logged in. JWT token missing.');
      this.router.navigate(['/login']);
    }
  
    this.renderChart();
  }

  fetchData(): void {
    // Using forkJoin to wait for multiple data fetches
    forkJoin([
      this.authService.getTenants(),
      this.authService.getApartments(),
    ]).subscribe(
      ([tenants, apartments]) => {
        this.tenants = tenants;
        this.apartments = apartments;
        this.updateSummaryStats();  // Update stats after apartments and tenants are fetched
        this.fetchTotalIncomeSinceStartOfYear();  // Recalculate total income after fetching tenants
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
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
  closeConcernsModal(){
    const modal = document.getElementById("ConcernsModal")
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

  getConcerns() {
    this.authService.getConcerns().subscribe(
      (response: any[]) => {
        console.log('Concerns fetched:', response);
        this.concerns = response.map(concern => {
          return {
            ...concern,
            image_path: `http://localhost/amsAPI/api/${concern.image_path}` // Adjust the base URL as needed
          };
        });
        console.log('Concerns with updated image paths:', this.concerns);
      },
      (error) => {
        console.error('Error fetching concerns:', error);
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

  deletePost(postId: number) {
    this.authService.deletePost(postId).subscribe(
      (response) => {
        console.log('Post deleted:', response);
        // Remove the deleted post from the posts array
        this.posts = this.posts.filter(post => post.post_id !== postId);
      },
      (error) => {
        console.error('Error deleting post:', error);
      }
    );
  }

  updateSummaryStats(): void {
    this.vacantCount = this.apartments.filter(a => !a.tenant_id).length;
    this.acquiredCount = this.apartments.length - this.vacantCount;

    this.income = this.tenants.reduce((total, tenant) => total + tenant.amount, 0);
  }
  
  calculateStatus(dueDate: string): string {
    const currentDate = new Date();
    const due = new Date(dueDate);
  
    if (due > currentDate) {
      return 'pending';
    } else if (due.toDateString() === currentDate.toDateString()) {
      return 'due today';
    } else {
      return 'overdue';
    }
  }


  getMaintenance(): void {
    this.authService.getMaintenance().subscribe(
      (response) => {
        console.log('Maintenance tasks fetched:', response);
        this.maintenanceList = response.data; // Access the 'data' property that contains the maintenance tasks
  
        // Calculate the total expenses for the year 2024
        this.totalExpenses = this.maintenanceList.reduce((total, task) => {
          const taskYear = new Date(task.start_date).getFullYear(); // Get the year from the start date
          if (taskYear === 2024) {
            // Only sum expenses if the task is in 2024
            return total + parseFloat(task.expenses || '0'); // Ensure it's treated as a number
          }
          return total; // Skip tasks not in 2024
        }, 0);
  
        // Group maintenance expenses by month for 2024 (if needed)
        this.groupMaintenanceExpensesByMonth();
      },
      (error) => {
        console.error('Error fetching maintenance tasks:', error);
      }
    );
  }
  
  

  // Group maintenance expenses by month
  groupMaintenanceExpensesByMonth(): void {
    // Reset the monthly expenses object
    this.monthlyExpenses = {};

    // Loop through the maintenance tasks and group them by month
    this.maintenanceList.forEach((task) => {
      const month = new Date(task.start_date).toLocaleString('default', { month: 'short' }) + ' ' + new Date(task.start_date).getFullYear();
      
      // If the month already exists, add to the total expenses, else initialize it
      if (this.monthlyExpenses[month]) {
        this.monthlyExpenses[month] += parseFloat(task.expenses || '0');
      } else {
        this.monthlyExpenses[month] = parseFloat(task.expenses || '0');
      }
    });

    // Log monthly expenses for debugging
    console.log('Monthly Expenses:', this.monthlyExpenses);

    // After calculating the monthly expenses, render the chart
    this.renderChart();
  }

  renderChart(): void {
    // Define the months of the year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize an array to hold the income and expense data for each month
    const incomeData = new Array(12).fill(0);
    const expenseData = new Array(12).fill(0);

    // Loop through each month to fetch monthly income
    const fetchIncomePromises = months.map((month, index) => {
      const currentMonth = index + 1;  // Convert index to month number (1-based)
      const currentYear = new Date().getFullYear();

      // Fetch the monthly income data for this month
      return this.authService.getMonthlyIncome(currentMonth, currentYear).toPromise().then((response) => {
        incomeData[index] = response.total_income;
        
        // Set expense data using the grouped maintenance expenses (or 0 if no data for that month)
        expenseData[index] = this.monthlyExpenses[`${month} ${currentYear}`] || 0;

      }).catch((error) => {
        console.error(`Error fetching income for ${month}:`, error);
      });
    });

    // Wait for all monthly income data to be fetched
    Promise.all(fetchIncomePromises).then(() => {
      // Render the chart after all data has been fetched
      const ctx = document.getElementById('income-expense-chart') as HTMLCanvasElement;

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,  // Use the month names
          datasets: [
            {
              label: 'Income',
              data: incomeData,  // Monthly income data
              backgroundColor: '#3eb06e',
            },
            {
              label: 'Expenses',
              data: expenseData,  // Monthly expenses data
              backgroundColor: '#241E57',  // Example color for expenses
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
        Swal.fire({
          icon: 'success',
          title: 'Post Created',
          text: 'Your announcement post has been created successfully!',
        }).then(() => {
          this.getPosts(); // Refresh posts
          this.title = '';
          this.content = '';
          this.selectedFile = null;
        });
      },
      (error) => {
        console.error('Error creating post:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create the post. Please try again later.',
        });
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
        Swal.fire({
          icon: 'success',
          title: 'Apartment Created',
          text: 'The apartment has been created successfully!',
        }).then(() => {
          this.getApartments(); // Refresh apartments
          // Reset the input fields
          this.room = '';
          this.rent = 0;
          this.description = '';
        });
      },
      (error) => {
        console.error('Error creating apartment:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create the apartment. Please try again later.',
        });
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

  onApartmentChange(): void {
    if (this.selectedApartmentId) {
      // Convert selectedApartmentId to a number
      const selectedApartmentIdNumber = Number(this.selectedApartmentId);
  
      // Debug: Log the selected apartment ID and tenants
      console.log('Selected Apartment ID:', selectedApartmentIdNumber);
      console.log('Apartments:', this.apartments);
  
      // Debug: Check the type of selectedApartmentId and apartment.apartment_id
      console.log('Type of selectedApartmentId:', typeof selectedApartmentIdNumber);
      console.log('Type of apartment_id:', typeof this.apartments[0].apartment_id);
  
      // Find the selected apartment from the apartments array
      const selectedApartment = this.apartments.find(
        (apartment) => apartment.apartment_id === selectedApartmentIdNumber
      );
  
      // Debug: Log the found apartment
      console.log('Selected Apartment:', selectedApartment);
  
      if (selectedApartment) {
        // Check if the selected apartment already has a tenant assigned
        const assignedTenantId = selectedApartment.tenant_id;
        console.log('Assigned Tenant ID:', assignedTenantId);
        
        if (assignedTenantId) {
          // Find the tenant assigned to this apartment
          const assignedTenant = this.tenants.find(
            (tenant) => tenant.tenant_id === assignedTenantId
          );
  
          // Debug: Log the found tenant
          console.log('Assigned Tenant:', assignedTenant);
  
          if (assignedTenant) {
            // Automatically select the tenant for this apartment
            this.selectedTenantId = assignedTenant.tenant_id;
  
          }
        } else {
          // No tenant assigned, clear the selected tenant ID
          this.selectedTenantId = null;
          
        }
      } else {
        // Debug: Log if apartment is not found
        console.error('Apartment not found in the list.');
  
        // Apartment not found
        this.selectedTenantId = null;
        Swal.fire({
          icon: 'error',
          title: 'Apartment Not Found',
          text: 'The selected apartment could not be found in the list.',
        });
      }
    } else {
      // No apartment selected, clear the selected tenant ID
      this.selectedTenantId = null;
      Swal.fire({
        icon: 'warning',
        title: 'No Apartment Selected',
        text: 'Please select an apartment to proceed.',
      });
    }
  }
  

  fetchTotalIncomeSinceStartOfYear(): void {
    const currentYear = new Date().getFullYear();
    let totalIncomeSinceStartOfYear = 0;
    for (let month = 1; month <= new Date().getMonth() + 1; month++) {
      this.authService.getMonthlyIncome(month, currentYear).subscribe(
        (response) => {
          const monthlyIncome = parseFloat(response.total_income.replace(/[^0-9.-]+/g, ""));
          if (!isNaN(monthlyIncome)) {
            totalIncomeSinceStartOfYear += monthlyIncome;
          } else {
            console.error(`Invalid income data for month ${month}:`, response.total_income);
          }
        },
        (error) => {
          console.error(`Error fetching income for month ${month}:`, error);
        },
        () => {
          this.totalIncome = totalIncomeSinceStartOfYear;
          console.log('Total income from January to today:', this.totalIncome);
        }
      );
    }
  }
  

  
  // Updated method to handle only 'remove_tenant'
  updateApartmentAndTenant(action: string) {
    if (!this.selectedApartmentId) {
      Swal.fire({
        icon: 'warning',
        title: 'Apartment Selection Required',
        text: 'Please select an apartment to proceed.',
      });
      return;
    }
  
    if (action === 'remove_tenant') {
      if (!this.selectedTenantId) {
        Swal.fire({
          icon: 'warning',
          title: 'Tenant Selection Required',
          text: 'Please select a tenant to remove.',
        });
        return;
      }
  
      const updateData: any = {
        apartment_id: this.selectedApartmentId,
        action: action,
        tenant_id: this.selectedTenantId,
      };
  
      this.authService.updateApartmentAndTenant(updateData).subscribe(
        (response) => {
          console.log('Tenant removed successfully:', response);
          Swal.fire({
            icon: 'success',
            title: 'Tenant Removed',
            text: 'The tenant has been removed successfully!',
          }).then(() => {
            this.getApartments(); // Refresh apartments
            this.getTenants();   // Refresh tenants
            // Clear the selections
            this.selectedApartmentId = null;
            this.selectedTenantId = null;
          });
        },
        (error) => {
          console.error('Error removing tenant:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error Removing Tenant',
            text: 'Failed to remove the tenant. Please try again later.',
          });
        }
      );
    } else if (action === 'assign_tenant') {
      if (!this.selectedTenantId) {
        Swal.fire({
          icon: 'warning',
          title: 'Tenant Selection Required',
          text: 'Please select a tenant to assign.',
        });
        return;
      }
  
      const assignmentData: any = {
        apartment_id: this.selectedApartmentId,
        tenant_id: this.selectedTenantId,
      };
  
      this.authService.assignTenantToApartment(assignmentData).subscribe(
        (response) => {
          console.log('Tenant assigned successfully:', response);
          Swal.fire({
            icon: 'success',
            title: 'Tenant Assigned',
            text: 'The tenant has been assigned successfully!',
          }).then(() => {
            this.getApartments();                // Refresh apartments
            this.getTenants();                   // Refresh tenants
            // Clear the selections
            this.selectedApartmentId = null;
            this.selectedTenantId = null;
          });
        },
        (error) => {
          console.error('Error assigning tenant:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error Assigning Tenant',
            text: 'Failed to assign the tenant. Please try again later.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Action',
        text: 'The specified action is not valid.',
      });
    }
  }
  
  
  selectConcern(concern: any): void {
    this.selectedConcern = { ...concern };  // Create a copy to avoid mutating original data
  }

  markAsSolved(concern: any) {
    concern.status = 'solved';
    this.authService.updateConcerns(concern).subscribe(
      (response) => {
        console.log('Concern marked as solved:', response);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Concern marked as solved.',
        });
      },
      (error) => {
        console.error('Error updating concern:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update the concern. Please try again later.',
        });
      }
    );
  }

  
  checkTenantAssignment(): void {
    const selectedTenant = this.tenants.find(tenant => tenant.tenant_id === this.selectedTenantId);
    
    if (selectedTenant && selectedTenant.room) {
      Swal.fire({
        icon: 'info',
        title: 'Tenant Already Assigned',
        text: `This tenant is already assigned to apartment: ${selectedTenant.room}`,
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Tenant Not Assigned',
        text: 'This tenant is not currently assigned to any apartment.',
      });
    }
  }
  
  // Cancel the edit and reset the form
  cancelEdit(): void {
    this.selectedConcern = null;  // Clear the selected concern to hide the form
  }

  deleteTenant(tenantId: number): void {
    // Show confirmation modal
    Swal.fire({
      icon: 'warning',
      title: 'Delete Tenant?',
      text: 'Are you sure you want to delete this tenant? This action cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with deletion
        this.authService.deleteTenant(tenantId).subscribe(
          (response) => {
            if (response.status === 'success') {
              Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: 'The tenant has been successfully deleted.',
              }).then(() => {
                // Remove the tenant from the list
                this.tenants = this.tenants.filter(tenant => tenant.tenant_id !== tenantId);
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Deletion Failed',
                text: response.message || 'An error occurred while trying to delete the tenant.',
              });
            }
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete the tenant. Please try again later.',
            });
            console.error('Error deleting tenant:', error);
          }
        );
      }
    });
  }
  



}