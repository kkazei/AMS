import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../services/auth.services';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';


Chart.register(...registerables); // Register Chart.js components

@Component({
  selector: 'app-landlord-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule,],
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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);
  
      this.fetchData();
      this.getConcerns();
      this.getMaintenance();  // Fetch maintenance tasks when component initializes
      this.getPosts();
    } else {
      console.error('User not logged in. JWT token missing.');
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

  updateSummaryStats(): void {
    this.vacantCount = this.apartments.filter(a => !a.tenant_id).length;
    this.acquiredCount = this.apartments.length - this.vacantCount;

    this.income = this.tenants.reduce((total, tenant) => total + tenant.amount, 0);
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
              backgroundColor: '#f56c42',  // Example color for expenses
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
          this.fetchTotalIncomeSinceStartOfYear(); // Recalculate total income
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
  selectConcern(concern: any): void {
    this.selectedConcern = { ...concern };  // Create a copy to avoid mutating original data
  }

  // Handle the form submission to update the concern
  updateConcern(updatedConcern: any): void {
    this.authService.updateConcerns(updatedConcern).subscribe(
      (response) => {
        console.log('Concern updated successfully:', response);
        this.getConcerns();  // Reload concerns after successful update
        this.selectedConcern = null;  // Reset selected concern
      },
      (error) => {
        console.error('Error updating concern:', error);
        // Show an error message if needed
      }
    );
  }
  checkTenantAssignment(): void {
    const selectedTenant = this.tenants.find(tenant => tenant.tenant_id === this.selectedTenantId);
    if (selectedTenant && selectedTenant.room) {
      this.message = `Tenant is already assigned to apartment: ${selectedTenant.room}`;
    } else {
      this.message = '';
    }
  }
  // Cancel the edit and reset the form
  cancelEdit(): void {
    this.selectedConcern = null;  // Clear the selected concern to hide the form
  }




}