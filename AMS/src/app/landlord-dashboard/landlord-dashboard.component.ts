import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables); // Register Chart.js components

@Component({
  selector: 'app-landlord-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './landlord-dashboard.component.html',
  styleUrls: ['./landlord-dashboard.component.css']
})
export class LandlordDashboardComponent implements OnInit {
  chart: Chart | undefined;

  ngOnInit(): void {
    this.renderChart();
  }

  renderChart(): void {
    const ctx = document.getElementById('income-expense-chart') as HTMLCanvasElement;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Income',
            data: [150000, 170000, 140000, 160000, 180000, 200000, 190000, 175000, 185000, 195000, 210000, 220000],
            backgroundColor: '#3eb06e',
            borderColor: '#3eb06e',
            borderWidth: 1
          },
          {
            label: 'Expenses',
            data: [30000, 40000, 35000, 38000, 50000, 45000, 47000, 48000, 50000, 52000, 55000, 58000],
            backgroundColor: '#2b305e',
            borderColor: '#2b305e',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Income and Expenses Overview of 2024'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}
