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
  tenants: any[] = [];
  apartments: any[] = [];
  posts: any[] = [];
  room: string = '';
  currentDate: string = new Date().toLocaleDateString();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      this.fetchData();
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

  getTenants(): void {
    this.authService.getTenants().subscribe(
      (response) => {
        if (Array.isArray(response)) {
          this.tenants = response.map((tenant) => ({
            ...tenant,
            amount: tenant.amount, // Bind dynamic amount
            date: new Date(tenant.date), // Bind dynamic date
            status: tenant.status, // Bind dynamic status
            transaction: tenant.transaction || 'N/A', // Bind dynamic transaction or default to 'N/A'
          }));
        }
      },
      (error) => console.error('Error fetching tenants:', error)
    );
  }

  getApartments(): void {
    this.authService.getApartments().subscribe(
      (response) => (this.apartments = response),
      (error) => console.error('Error fetching apartments:', error)
    );
  }

  getPosts(): void {
    this.authService.getPosts().subscribe(
      (response) => (this.posts = response),
      (error) => console.error('Error fetching posts:', error)
    );
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
}